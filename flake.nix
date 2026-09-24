{
  description = "TanStack Start dev environment (Vite+)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nix-vite-plus = {
      url = "github:ryoppippi/nix-vite-plus";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    { nixpkgs, nix-vite-plus, ... }:
    let
      # nix-vite-plus が vp を提供しているシステムに合わせる
      systems = [
        "aarch64-darwin"
        "aarch64-linux"
        "x86_64-linux"
      ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system} system);
    in
    {
      devShells = forAllSystems (
        pkgs: system: {
          # Node.js / pnpm は vp が package.json の devEngines に従って用意する
          default = pkgs.mkShell {
            packages = [ nix-vite-plus.packages.${system}.vp ];
          };
        }
      );

      formatter = forAllSystems (pkgs: _: pkgs.nixfmt-rfc-style);
    };
}
