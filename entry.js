JSONEditor = require('./node_modules/jsoneditor/dist/jsoneditor')
jsonmergepatch = require('json-merge-patch')
jquery = require('jquery')

var metaschema = require('json!./metaschema.json')

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

    //console.log('Mode switched from', oldMode, 'to', newMode);
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
    //console.log('Mode switched from', oldMode, 'to', newMode);
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
  console.log(file_name)
  saveAs(blob, file_name);
};

// set json
//editor.set(json);

// get json
//document.getElementById('getJSON').onclick = function () {
//  var json = editor.get();
//  alert(JSON.stringify(json, null, 2));
//};
