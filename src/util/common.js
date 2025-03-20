export async function failwith(m) {
    console.error(m);
    process.exit(1);
}