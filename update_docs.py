#!/usr/bin/python2.7
# Update the demo page in docs/ directory.

# - The source path must be relative to the current directory.
# - The base name of the source path is same with the destination filename by
#   default.
sourceMap = {
  "block_of_ocaml_utils.js": "block_of_ocaml/utils.js",
  "converter.js": "block_of_ocaml/",
  "blockly_compressed.js": "./",
  "blocks_compressed.js": "./",
  "typedlang_compressed.js": "./",
  "en.js": "msg/js/",
  "ja.js": "msg/js/",
  "index.html": "demos/typed/dev.html",
  "style.css": "demos/typed/",
  "typed.js": "demos/typed/",
}

import os, shutil

def verify_sourcepath():
  for filename, source_path in sourceMap.items():
    basename = os.path.basename(source_path)
    if not basename:
      sourceMap[filename] += filename

def copy_files():
  for filename, src in sourceMap.items():
    shutil.copy(src, 'docs/' + filename)

def edit_copied_files():
  disable_devmode()
  # TODO(harukam): Edit dev.html to load compressed JS files in docs/ instead
  # of uncompressed ones.
  pass

import re

def disable_devmode():
  path = 'docs/typed.js'
  if not os.path.isfile(path):
    raise Exception('Not found script: ' + path)

  pattern = r'^(Typed\.DEVMODE = )(true|false);'
  replacement = r'\1false;'

  with open(path, 'r+') as f:
    # Find the statement `Typed.DEVMODE = (true|false);` in the script.
    body = f.read()
    m = re.search(pattern, body, flags=re.MULTILINE)
    if not m:
      raise Exception('Not found DEVMODE statement')

    # Disable the debugging mode if it's enabled.
    if m.group(2) == 'true':
      replaced_body = re.sub(pattern, replacement, body, 1, flags=re.MULTILINE)
      f.seek(0)
      f.truncate()
      f.write(replaced_body)

if __name__ == "__main__":
  verify_sourcepath()
  copy_files()
  edit_copied_files()
