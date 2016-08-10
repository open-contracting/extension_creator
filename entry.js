var JSONEditor = require('./node_modules/jsoneditor/dist/jsoneditor');
var jsonmergepatch = require('json-merge-patch');
var JSZip = require("jszip");

var metaschema = require('json!./metaschema.json');

var schemas = {
  'release-schema': require('json!./release-schema.json'),
  'record-package-schema': require('json!./record-package-schema.json'),
  'release-package-schema': require('json!./release-package-schema.json')
}
var file_name = 'release-schema.json'


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
  file_name = event.target.value + '.json';
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
  var blob = new Blob([editor_patch.getText()], {type: 'application/json;charset=utf-8'});
  saveAs(blob, file_name);
};

document.getElementById('generate-extension').onclick = function () {
  var name = document.getElementById('extension-name').value
  var description = document.getElementById('extension-description').value
  if (!name || !description) {
    return true
  }
  
  var generated_patch = jsonmergepatch.generate(editor_original.get(), editor_target.get())

  var zip = new JSZip();
  var patch_files = {
    'record-package-schema.json': "{}",
    'release-package-schema.json': "{}",
    'release-schema.json': "{}",
    'versioned-release-validation-schema.json': "{}"
  }

  if (file_name === 'record-package-schema.json' || file_name === 'release-package-schema.json') {
    patch_files[file_name] = JSON.stringify(generated_patch, null, 2)
  } else {
    patch_files[file_name] = JSON.stringify(generated_patch, null, 2)  
  }

  Object.keys(patch_files).forEach(function(key) {
    zip.file(key, patch_files[key])
  })

  zip.file('README.md', description)
  zip.file('extension.json', JSON.stringify({"name": name, "desription": description}))
  var docs = zip.folder('docs')
  docs.file("index.md", "")
  zip.generateAsync({type:"blob"})
    .then(function(content) {
        saveAs(content, name+".zip");
    });

  return false;

};

// set json
//editor.set(json);

// get json
//document.getElementById('getJSON').onclick = function () {
//  var json = editor.get();
//  alert(JSON.stringify(json, null, 2));
//};
