import argparse
import sys

from .layout import export, load_config


def main():
    parser = argparse.ArgumentParser(description="Create a private, local keepsake card")
    parser.add_argument("--config", required=True, help="JSON config path")
    parser.add_argument("--out", default="exports/card")
    parser.add_argument("--target", choices=["all", "print", "preview", "wallpaper"],
                        default="all")
    args = parser.parse_args()
    try:
        paths = export(load_config(args.config), args.out, args.target)
    except (ValueError, OSError) as exc:
        print("Cannot create card: " + str(exc), file=sys.stderr)
        return_code = 2
    else:
        for path in paths:
            print(path)
        return_code = 0
    if return_code:
        raise SystemExit(return_code)


if __name__ == "__main__":
    main()
