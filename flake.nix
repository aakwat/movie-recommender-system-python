{
  description = "Python + uv, for Django, FastAPI or Flask";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { nixpkgs, ... }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        # Framework packages come from uv into .venv, not from nixpkgs.
        packages = with pkgs; [
          python3
          uv
          ruff
          basedpyright
        ];
        # PyPI wheels (numpy, scikit-learn) link against these, which NixOS keeps off the default path.
        LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [ pkgs.stdenv.cc.cc.lib pkgs.zlib ];
      };
    };
}
