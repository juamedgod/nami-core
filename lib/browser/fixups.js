'use strict';

const _ = require('nami-utils/lodash-extra.js');
function fixupDocumentLiveForms(document) {
  _.each(document.forms, function(f) {
    // We are interested in all properties. hasOwnProperty is not enough
    if (f.name && ! (f.name in document)) {
      Object.defineProperty(document, f.name, {
        get: function() {
          return f;
        }
      });
      _.each(f.getElementsByTagName('INPUT'), function(e) {
        if (e.name && ! (e.name in f)) {
          Object.defineProperty(f, e.name, {
            get: function() {
              return e;
            }
          });
        }
        if (e.id && ! (e.id in f)) {
          Object.defineProperty(f, e.id, {
            get: function() {
              return e;
            }
          });
        }
      });
    }
  });
}

// This is fixed in jsdom 9.5.0, by returning a live HTMLCollection instead
// of a nodelist
function fixupDocumentFormsByID(document) {
  const getElementsByTagName = document.getElementsByTagName;
  document.getElementsByTagName = function(tag) {
    const collection = getElementsByTagName.apply(this, arguments);
    if (tag === 'FORM') {
      _.each(collection, form => {
        if ('id' in form && !(form.id in collection)) {
          Object.defineProperty(collection, form.id, {
            get: function() {
              return form;
            }
          });
        }
      });
    }
    return collection;
  };
}

function fixupDocument(document, fixupList) {
  const fixups = {
    'living_forms': fixupDocumentLiveForms,
    'forms_by_id': fixupDocumentFormsByID
  };
  _.each(fixupList, fixupName => {
    if (fixupName in fixups) {
      fixups[fixupName](document);
    }
  });
}

module.exports = fixupDocument;
