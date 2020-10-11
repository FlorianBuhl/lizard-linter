# lizard-linter

This package executes lizard cyclomatic complexity tooling in [Atom Editor](http://atom.io)
This package is basically an plugin for [Linter](https://github.com/AtomLinter/Linter).

The lizard linter analyzes functions for
- cyclomatic complexity.
- the number of number of parameters
- the line number of  function without comments
- the token number

For each of them an own warning threshold can be defined in the settings.
On file save the tool will run automatically in the background and if a threshold is exceeded a warning will be shown in the editor.

The following languages are supported:
- c
- cpp
- c#
- GDScript
- GoLang
- Java
- JavaScript
- Lua
- ObjectiveC
- PHP
- Python
- Ruby
- Rust
- Scala
- SWIFT

The lizard tool itself is not part of this package.
For details about lizard tool and how to install it please refer to https://github.com/terryyin/lizard.

# Licence

The MIT License (MIT)

Copyright (c) 2020 Buhl Florian

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
