# lizard-linter

[![Build Status](https://img.shields.io/circleci/build/gh/FlorianBuhl/lizard-linter.svg?style=plastic)](https://app.circleci.com/pipelines/github/FlorianBuhl/lizard-linter)
[![Dependencies](https://img.shields.io/david/FlorianBuhl/lizard-linter?style=plastic)](https://david-dm.org/FlorianBuhl/lizard-linter)

This package executes lizard cyclomatic complexity tooling in [Atom Editor](http://atom.io)
This package is basically an plugin for [Linter](https://github.com/AtomLinter/Linter).
It uses [lizard](https://github.com/terryyin/lizard) tool to show the cyclomatic complexity in atom.

The lizard linter analyzes functions for
- cyclomatic complexity.
- the number of number of parameters
- the line number of  function without comments
- the token number

On file save the tool will run automatically in the background and if a threshold is exceeded a warning will be shown in the editor.
For each of them an own warning threshold can be defined in the settings.

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

# Cyclomatic Complexity

The cyclomatic complexity number is basically the number of decisions in the source code.
The higher the number the more complex and the more tests you need to verify the function.
E.g. a cyclomatic complexity of 3 would require at least 3 tests to verify the function.

The linter shall help you to keep your functions slim and less complex and easy to test.

# Installation

The lizard tool itself is not part of this package.
For details about lizard tool and how to install it please refer to https://github.com/terryyin/lizard.

The lizard-linter package can be installed either by using the ATOM GUI or by:

```
$ apm install lizard-Linter
````

# Licence

This package is licensed under the MIT license. For details please check the [LICENSE.md](LICENSE.md) file.
