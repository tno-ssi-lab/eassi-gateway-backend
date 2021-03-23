import re
from pathlib import Path
from glob import iglob
from typing import List, Tuple

class ModuleDeps:
    """
    Generate a graph of all modules and their dependencies.

    By inspecting the graph you can check the dependencies of each module. This
    way, you can check indented and unintented relations between your modules.
    Ideally, this would be a DAG (directed acyclic graph), since then you don't
    need forward refs or other 'hacks'.

    The class is quite dumb, which is on purpose. It just looks at every
    *.module.ts file in your src directory and looks for any occurence of
    <Name>Module anywhere in the file. It doesn't even respect comments
    currently. This way it's mostly correct and doesn't depend on actual module
    resolution mechanisms.

    Example usage:
    >>> m = ModuleDeps()
    >>> m.build()
    >>> print(m.graph)
    >>> m.write_dot()
    """
    dir: str = "src"
    graph: List[Tuple[str, str]] = []
    suffix_length = len(".module.ts")

    def __init__(self, dir: str = "src") -> None:
        self.dir = dir

    def build(self) -> None:
        for module in (Path(p) for p in iglob(f"{self.dir}/**/*.module.ts", recursive=True)):
            name = module.name[:-self.suffix_length]
            with open(module) as f:
                for match in set(m.lower() for m in re.findall(r"\b(\w+)Module\b", f.read())):
                    if match != name:
                        self.graph.append((name, match))

    def write_dot(self, output: str = "modules.dot") -> None:
        with open(output, "w") as f:
            f.write("digraph Modules {\n")

            for (src, dest) in self.graph:
                f.write(f"  {src} -> {dest};\n")

            f.write("}\n")

if __name__ == "__main__":
    m = ModuleDeps()
    m.build()
    m.write_dot()
