import ghpages from 'gh-pages';

console.log("-------------------------------------------------");
console.log("🚀 Iniciando despliegue directo en GitHub Pages...");
console.log("-------------------------------------------------");

ghpages.publish('dist', {
    repo: 'https://github.com/IvanSanchez18/tfg-2daw-ivan.git',
    branch: 'gh-pages',
    silent: false
}, function(err) {
    if (err) {
        console.error("\n❌ Error durante el despliegue:", err);
    } else {
        console.log("\n▲ ¡Perfecto! Despliegue completado con éxito en GitHub Pages.");
        console.log("Tu web estará disponible en unos minutos.");
    }
});