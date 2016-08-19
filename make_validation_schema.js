'use strict';
var version_template = {
    'type': 'array',
    'items': {
        'properties': {
            'releaseDate': {
                'format': 'date-time',
                'type': 'string'
            },
            'releaseID': {
                'type': 'string'
            },
            'value': {
            },
            'releaseTag': {
                'type': 'array',
                'items': {'type': 'string'}
            }
        }
   }
};

function deepcopy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function add_versions(schema) {
  Object.keys(schema.properties).forEach(function(key) {
    var value = schema.properties[key];
    var prop_type = value.type;
    delete value.title;
    delete value.description;
    var mergeStrategy = value.mergeStrategy;
    delete value.mergeStrategy;
    delete value.mergeOptions;
    if (!prop_type) { return }
    if (mergeStrategy === 'overwrite') { return }

    var json_string = JSON.stringify(["string","null"])
    if (JSON.stringify(prop_type) === json_string && !value.hasOwnProperty('enum')) {
      var new_value = {};
      var format = value.format 
      if (format == 'uri') {
          new_value['$ref'] = '#/definitions/StringNullUriVersioned';
      } else if (format == 'date-time') {
          new_value['$ref'] = '#/definitions/StringNullDateTimeVersioned';
      } else {
          new_value['$ref'] = '#/definitions/StringNullVersioned';
      }
      schema['properties'][key] = new_value;
    } else if (prop_type === 'array') {
      var version = deepcopy(version_template)
      var version_properties = version['items']['properties'];
      if (mergeStrategy === 'ocdsVersion') {
        new_value = deepcopy(value);
        if (new_value['items'].hasOwnProperty('$ref')) {
          new_value['items']['$ref'] = value['items']['$ref'] + 'Unversioned';
        }
        version_properties['value'] =  new_value;
        schema['properties'][key] = version;
      }
    } else if (prop_type === 'object') {
      add_versions(value);
    } else {
      var version = deepcopy(version_template);
      var version_properties = version['items']['properties'];
      version_properties['value'] = value;
      schema['properties'][key] = version;
    }
  })
  Object.keys(schema.definitions || {}).forEach(function(key) {
    add_versions(schema.definitions[key]);
  })
}
    

function add_string_definitions(schema) {
  var lookup = {'StringNullUriVersioned': 'uri',
                'StringNullDateTimeVersioned': 'date-time',
                'StringNullVersioned': null}

  Object.keys(lookup).forEach(function(key) {
     var version = deepcopy(version_template);
     var version_properties = version['items']['properties'];
     version_properties['value'] = {'type': ['string', 'null']};
     if (lookup[key]) {
         version_properties['value']['format'] = lookup[key];
     }
     schema['definitions'][key] = version;
  })
}

function unversion_refs(schema) {
  Object.keys(schema).forEach(function(key) {
    var value = schema[key]
    if (key == '$ref') {
      schema[key] = value + 'Unversioned'
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
      unversion_refs(value);
    }
  })
}

function get_versioned_validation_schema(versioned_release) {
  versioned_release['id'] = 'http://standard.open-contracting.org/schema/1__0__1/versioned-release-validation-schema.json'
  versioned_release['$schema'] = 'http://json-schema.org/draft-04/schema#'
  versioned_release['title'] = 'Schema for a compiled, versioned Open Contracting Release.'
  var definitions = versioned_release['definitions'];

  var new_definitions = {};
  var definitions_copy = deepcopy(versioned_release['definitions'])
  Object.keys(definitions_copy).forEach(function(key) {
    new_definitions[key + 'Unversioned'] = definitions_copy[key];
  })

  unversion_refs(new_definitions);

  var ocid = versioned_release['properties']['ocid'];
  delete versioned_release['properties']['ocid'];
  delete versioned_release['properties']['date'];
  delete versioned_release['properties']['id'];
  delete versioned_release['properties']['tag'];

  versioned_release['required'] = [
      'ocid',
      'initiationType'
  ];
  add_versions(versioned_release);

  versioned_release['properties']['ocid'] = ocid;

  Object.keys(new_definitions).forEach(function(key) {
    definitions[key] = new_definitions[key]
  })

  add_string_definitions(versioned_release);

  Object.keys(definitions).forEach(function(key) {
    var value = definitions[key]
    delete value.title;
    delete value.description;
    if (!value.hasOwnProperty('properties')) {
       return;
    }
    Object.keys(value['properties']).forEach(function(key) {
      var prop_value = value['properties'][key]
      delete prop_value['mergeStrategy'];
      delete prop_value['mergeOptions'];
      delete prop_value['title'];
      delete prop_value['description'];
    })
  })
  return versioned_release;
}

exports.get_versioned_validation_schema = get_versioned_validation_schema;

