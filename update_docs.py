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
  # TODO(harukam): Support the following three features.
  # 1. Load compressed JS files in docs/ instead of uncompressed ones.
  # 2. Change title tag inside index.html.
  # 3. Remove path and media properties in the workspace options.
  pass

if __name__ == "__main__":
  verify_sourcepath()
  copy_files()
  edit_copied_files()
