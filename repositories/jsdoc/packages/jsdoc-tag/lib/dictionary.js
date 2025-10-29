/*
  Copyright 2010 the JSDoc Authors.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

/** @module @jsdoc/tag/lib/dictionary */

import definitions from './definitions/index.js';

const DEFINITIONS = {
  closure: 'getClosureTags',
  jsdoc: 'getJsdocTags',
};

/** @private */
class TagDefinition {
  #dictionary;

  constructor(dict, title, etc) {
    etc ??= {};

    this.#dictionary = dict;
    this.title = dict.normalize(title);

    Object.keys(etc).forEach((p) => {
      this[p] = etc[p];
    });
  }

  /** @private */
  synonym(synonymName) {
    this.#dictionary.defineSynonym(this.title, synonymName);

    return this;
  }
}

export class Dictionary {
  constructor() {
    // TODO: Consider adding internal tags in the constructor, ideally as fallbacks that aren't
    // used to confirm whether a tag is defined/valid, rather than requiring every set of tag
    // definitions to contain the internal tags.
    this._tags = {};
    this._tagSynonyms = new Map();
    // The longnames for `Package` objects include a `package` namespace. There's no `package`
    // tag, though, so we declare the namespace here.
    // TODO: Consider making this a fallback as suggested above for internal tags.
    this._namespaces = ['package'];
  }

  #defineNamespace(title) {
    title = this.normalize(title || '');

    if (title && !this._namespaces.includes(title)) {
      this._namespaces.push(title);
    }

    return this;
  }

  defineTag(title, opts) {
    const tagDef = new TagDefinition(this, title, opts);

    this._tags[tagDef.title] = tagDef;

    if (tagDef.isNamespace) {
      this.#defineNamespace(tagDef.title);
    }
    if (tagDef.synonyms) {
      tagDef.synonyms.forEach((synonym) => {
        this.defineSynonym(title, synonym);
      });
    }

    return this._tags[tagDef.title];
  }

  defineTags(tagDefs) {
    const tags = {};

    for (const title of Object.keys(tagDefs)) {
      tags[title] = this.defineTag(title, tagDefs[title]);
    }

    return tags;
  }

  defineSynonym(title, synonym) {
    this._tagSynonyms.set(synonym.toLowerCase(), this.normalize(title));
  }

  static fromEnv(env) {
    const dict = new Dictionary();
    const { conf, log } = env;
    let dictionaries = conf.tags.dictionaries;
    let tagDefs;

    if (!dictionaries) {
      log.error(
        'The configuration setting "tags.dictionaries" is undefined. ' +
          'Unable to load tag definitions.'
      );
    } else {
      dictionaries
        .slice()
        .reverse()
        .forEach((dictName) => {
          try {
            tagDefs = definitions[DEFINITIONS[dictName]](env);
          } catch (e) {
            log.error(
              'The configuration setting "tags.dictionaries" contains ' +
                `the unknown dictionary name ${dictName}. Ignoring the dictionary.`
            );

            return;
          }

          dict.defineTags(tagDefs);
        });

      dict.defineTags(definitions.getInternalTags());
    }

    return dict;
  }

  getNamespaces() {
    return this._namespaces.slice();
  }

  isNamespace(kind) {
    if (kind) {
      kind = this.normalize(kind);
      if (this._namespaces.includes(kind)) {
        return true;
      }
    }

    return false;
  }

  lookup(title) {
    return this.lookUp(title);
  }

  lookUp(title) {
    title = this.normalize(title);

    if (Object.hasOwn(this._tags, title)) {
      return this._tags[title];
    }

    return false;
  }

  normalise(title) {
    return this.normalize(title);
  }

  normalize(title) {
    const canonicalName = title.toLowerCase();

    return this._tagSynonyms.get(canonicalName) ?? canonicalName;
  }
}
