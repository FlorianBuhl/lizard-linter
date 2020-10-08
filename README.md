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

### Changelog
0.1.0 First version
