let
  pkgs = import <nixpkgs> {};

  nodejs = pkgs.nodejs-10_x;
  yarn = pkgs.yarn.override { inherit nodejs; };

in pkgs.mkShell {
  buildInputs = [
    nodejs
    yarn
  ];
}
