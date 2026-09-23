// Capa: Presentación
// Pequeña utilidad compartida por los controladores para mostrar
// notificaciones no bloqueantes (reemplaza a alert()).

export class Notificador {
    constructor(contenedorId = "toastContainer") {
        this.contenedor = document.getElementById(contenedorId);
    }

    mostrar(mensaje, tipo = "success") {
        const toast = document.createElement("div");
        toast.className = `toast ${tipo === "error" ? "error" : ""}`;
        toast.textContent = mensaje;
        this.contenedor.appendChild(toast);
        setTimeout(() => toast.remove(), 3200);
    }
}