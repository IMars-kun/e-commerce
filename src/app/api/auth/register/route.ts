import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "../../../../lib/db";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json
        const { name, email, password } = registerSchema.parse(body);

        const existing = await db.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { error: "Email already exists" },
                { status: 400 }
            );
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await db.user.create({
            data: { name, email, password: hashed },
        });

        return NextResponse.json(
            { message: "Registrasi berhasil", userId: user.id },
            { status: 201 }
        )
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}