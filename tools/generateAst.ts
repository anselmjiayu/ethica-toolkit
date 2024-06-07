import { open } from "node:fs/promises";
import type {WriteStream} from "node:fs"

/*
  GenerateAst: a tool for automating parser class declaration source code creation
 */

// =======


class GenerateAst {
    readonly dirPath;

    constructor(dirPath: string) {
        this.dirPath = dirPath;
    }

    async run() {
        const defExpr = this.defineAst(this.dirPath, "Expr",
            ["import { Token } from \"../interpreter/token\";"],
            [
                "Section      : Token term",
                "Label        : Token label, Expr term",
                "Preface      : Token term",
                "Definition   : Token term, Expr[] parts",
                "Axiom        : Token term",
                "Postulate    : Token term",
                "Proposition  : Token term, Expr[] parts",
                "Lemma        : Token term, Expr[] parts",
                "Demonstration: Token term",
                "Scholium     : Token term",
                "Corollary    : Token term",
                "Explanation  : Token term"
            ]);
        const defStmt = this.defineAst(this.dirPath, "Stmt",
            [
                "import { Token } from \"../interpreter/token\";",
                "import { Expr } from \"./Expr\";"
            ],
            [
                "Source       : Token title, (Stmt|Expr)[] parts",
                "Book         : Token title, Expr[] contents",
            ]);
        await Promise.all([defExpr, defStmt]);
    }

    private defineVisitor(writer: WriteStream, baseName: string, types: string[]) {
        writer.write("export interface " + baseName + "Visitor<R> {\n");
        types.map(type => {
            const typeName = type.split(":")[0].trim();
            writer.write("  visit" + typeName + baseName + "(" +
                baseName.toLowerCase() + ": " + typeName + "): R;\n");
        })
        writer.write("}\n");
        writer.write("\n");
    }

    private defineTypes(writer: WriteStream, baseName: string, className: string, fieldList: string) {

        writer.write("export class " + className + " extends " + baseName + "{\n");

        // fields format: [[Type, name]]
        const fields = fieldList.split(',').map(s => s.trim())
            .map(s => s.split(" "));

        // Constructor
        writer.write(`  constructor(${fields.map(f => f[1] + ": " + f[0])}) {\n`);
        writer.write("    super();\n");
        fields.map((f) => {
            writer.write(`    this.${f[1]} = ${f[1]};\n`);
        })
        writer.write("  }\n");

        // Visitor pattern.
        writer.write("\n");
        writer.write("  accept<R>(visitor: " + baseName + "Visitor<R>): R {\n");
        writer.write("    return visitor.visit"
            + className + baseName + "(this);\n");
        writer.write("  }\n");
        writer.write("\n");


        // Fields
        fields.map(f => writer.write(`  readonly ${f[1]}: ${f[0]};\n`));

        writer.write("}\n");
        writer.write("\n");
    }

    private async defineAst(outputDir: string, baseName: string, imports: string[], types: string[]) {
        const path: string = outputDir + "/" + baseName + ".ts";
        const fd = await open(path, 'w');
        const writer = fd.createWriteStream();

        // type import
        imports.map(line => {
            writer.write(line);
            writer.write("\n");
        })
        writer.write("\n");

        writer.write("export abstract class " + baseName + "{\n");
        // The base accept() method
        writer.write("  abstract accept<R>(visitor: " + baseName + "Visitor<R>): R;\n");
        writer.write("}\n");
        writer.write("\n");

        this.defineVisitor(writer, baseName, types);

        // Subtypes
        types.map((type: string) => {
            const className = type.split(":")[0].trim();
            const fields = type.split(":")[1].trim();
            this.defineTypes(writer, baseName, className, fields);
        })


        writer.close();
    }

}

// =======

// Require target directory

const dirPath = process.argv[2];
if (!dirPath) {
    console.error("Usage: tsx generateAst <output directory>");
    process.exitCode = 64;
} else {
    const builder = new GenerateAst(dirPath);

    // Run generate
    (() => builder.run())();
}
