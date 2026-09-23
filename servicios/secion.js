// Capa: Servicios
// Sesion guarda quién está autenticado en este momento y con qué rol,
// para que la capa de presentación sepa qué panel mostrar.
// Vive solo en memoria (no se persiste) por seguridad: al recargar la
// página, hay que volver a iniciar sesión.

export class Sesion {
    constructor() {
        this.personaActual = null;
        this.rolActual = null;
    }

    iniciar(persona, rol) {
        this.personaActual = persona;
        this.rolActual = rol;
    }

    cerrar() {
        this.personaActual = null;
        this.rolActual = null;
    }

    estaActiva() {
        return this.personaActual !== null;
    }
}