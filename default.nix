with import <nixpkgs> {};

stdenv.mkDerivation rec {
  name = "cat-feeder3.0";

  # Boilderplate for builable env
  env = buildEnv { name = name; paths = buildInputs; };
  builder = builtins.toFile "builder.sh" ''
    source $stdenv/setup; ln -s $env $out
  '';

  buildInputs = [
    python27
    nodejs-9_x
  ];
}