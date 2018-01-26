var JSONEditor = require('./node_modules/jsoneditor/dist/jsoneditor');
var jsonmergepatch = require('json-merge-patch');
var JSZip = require("jszip");

var metaschema = require('json!./metaschema.json');
var file_name = 'release-schema.json'

var schemas = {
  'release-schema-1.0': require('json!./release-schema/release-schema-1.0.json'),
  'release-schema-1.1': require('json!./release-schema/release-schema-1.1.json'),
  'release-package-schema-1.0': require('json!./release-package-schema/release-package-schema-1.0.json'),
  'release-package-schema-1.1': require('json!./release-package-schema/release-package-schema-1.1.json'),
  'record-package-schema-1.0': require('json!./record-package-schema/record-package-schema-1.0.json'),
  'record-package-schema-1.1': require('json!./record-package-schema/record-package-schema-1.1.json')
}


var original = document.getElementById('jsoneditor-original');
var options_original = {
  mode: 'view',
  schema: metaschema,
  onError: function (err) {
    alert(err.toString());
  },
  onModeChange: function (newMode, oldMode) {
  }
};
var editor_original = new JSONEditor(original, options_original, schemas['release-schema']);

FileReaderJS.setupInput(document.getElementById('upload-original'), {
  readAsDefault: 'Text',
  on: {
    load: function (event, file) {
      file_name = file.name
      editor_original.setText(event.target.result);
    }
  }
});
document.getElementById('select-original').onchange = function (event) {
  editor_original.set(schemas[event.target.value]);
  editor_target.setText('{}');
  editor_patch.setText('{}');
  file_name = event.target.value.replace(event.target.value.substr(-4), '.json')
}

var target = document.getElementById('jsoneditor-target');
var options_target = {
  mode: 'tree',
  modes: ['code', 'tree'], // allowed modes
  schema: metaschema,
  onError: function (err) {
    alert(err.toString());
  },
  onModeChange: function (newMode, oldMode) {
  }
};

var editor_target = new JSONEditor(target, options_target, {});

FileReaderJS.setupInput(document.getElementById('upload-target'), {
  readAsDefault: 'Text',
  on: {
    load: function (event, file) {
      editor_target.setText(event.target.result);
    }
  }
});

document.getElementById('copy-target').onclick = function (event) {
  editor_target.set(editor_original.get());
}


var patch = document.getElementById('jsoneditor-patch');
var options_patch = {
  mode: 'tree',
  modes: ['code', 'tree'] // allowed modes
//  schema: metaschema
};

var editor_patch = new JSONEditor(patch, options_patch, {});

document.getElementById('generate-patch').onclick = function (event) {
  var generated_patch = jsonmergepatch.generate(editor_original.get(), editor_target.get())
  if (!generated_patch) {
    generated_patch = {}
  }
  editor_patch.set(generated_patch);
}


document.getElementById('download-patch').onclick = function () {
  var patch = editor_patch.getText();
  if (patch !== '{}') {
    var json_object = JSON.parse(patch)
    var blob = new Blob([JSON.stringify(json_object, null, 2)], {type: 'application/json;charset=utf-8'});
    saveAs(blob, file_name);
  }
};

document.getElementById('generate-extension').onclick = function () {
  var name = document.getElementById('extension-name').value;
  var description = document.getElementById('extension-description').value;
  var documentationUrl = document.getElementById('extension-url').value;

  // Follow convention by requiring exactly two slashes after http(s):  
  var urlStartPattern = new RegExp('^https?:\/\/[^\/\\s][^\\s]+$', 'i');
  
  if (documentationUrl) {
    documentationUrl = documentationUrl.replace('\\r', '').replace('\\n', '');
    documentationUrl = documentationUrl.trim();
    if (!urlStartPattern.test(documentationUrl)) {
      var explanation =  ' is not a valid URL.'
      if (documentationUrl.indexOf('http') === -1){
        explanation += ' Make sure that it starts with "http://" or "https://"';
      }
      alert('"' + documentationUrl + '"' + explanation);
      return false
    }
  }

  if (!name || !description) {
    return true
  }

  var generated_patch = jsonmergepatch.generate(editor_original.get(), editor_target.get())
  var zip = new JSZip();
  var patch_files = {
    'release-schema.json': '{}',
    'release-package-schema.json': '{}',
    'record-package-schema.json': '{}',
  }
  patch_files[file_name] = JSON.stringify(generated_patch, null, 2);

  Object.keys(patch_files).forEach(function(key) {
    if (patch_files[key] != '{}') {
      zip.file(key, patch_files[key])
    }
  })

  zip.file('README.md', description)
  zip.file('extension.json', JSON.stringify({
    'name': {'en': name},
    'description': {'en': description},
    'documentationUrl': {'en': documentationUrl}
  }))
  var docs = zip.folder('docs')
  docs.file('index.md', '')
  zip.generateAsync({type: 'blob'})
    .then(function(content) {
        saveAs(content, name + '.zip');
    });

  return false;

};

