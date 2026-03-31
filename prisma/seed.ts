import { db } from "../src/lib/db.js";
import bcrypt from "bcryptjs";

async function main() {

    await db.user.upsert({
        where: { email: "admin@tokoku.com"},
        update: {},
        create: {
            name: "Admin Tokoku",
            email: "admin@tokoku.com",
            password: await bcrypt.hash("admin123", 10),
            role: "ADMIN",
        },
    });

    const elektronik = await db.category.upsert({
        where: { slug: "elektronik"},
        update: {},
        create: { name : "Elektronik", slug: "elektronik" },
    });

    const fashion = await db.category.upsert({
        where: { slug: "fashion"},
        update: {},
        create: { name : "Fashion", slug: "fashion" },
    });

    await db.product.createMany({
        data: [
            {
                name: "Laptop",
                slug: "laptop",
                price: 10000000,
                originalPrice: 12000000,
                description: "Laptop gaming",
                stock: 10,
                categoryId: elektronik.id,
                images: ["https://images.unsplash.com/photo-1525547719533-7494f584cf62"],
            },
            {
                name: "Sepatu",
                slug: "sepatu",
                price: 500000,
                originalPrice: 700000,
                description: "Sepatu keren",
                stock: 10,
                categoryId: fashion.id,
                images: ["https://images.unsplash.com/photo-1525547719533-7494f584cf62"],
            },
        ],
        skipDuplicates: true,
    });

    console.log("✅ Seeding complete");
}

main()
    .catch(console.error)
    .finally(() => db.$disconnect());