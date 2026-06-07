# Import Format parser registry

Built-in Import Formats use an internal parser registry instead of a runtime plugin system. Each bank export parser implements the same detection and parsing contract, so adding another supported bank means adding a parser module and tests while the main import flow stays unchanged.
