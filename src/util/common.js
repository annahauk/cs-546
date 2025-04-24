export async function failwith(m) {
    console.error(m);
    process.exit(1);
}

export function exit(code) {
    process.exit(code);
}