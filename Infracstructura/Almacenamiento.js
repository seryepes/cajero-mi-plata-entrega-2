// Capa: Infraestructura
// Almacenamiento aísla el acceso a localStorage. Ninguna otra clase del
// sistema debe llamar a localStorage directamente: si mañana se cambia
// por una API real, solo se toca este archivo.

export class Almacenamiento {
    guardar(clave, datos) {
        try {
            localStorage.setItem(clave, JSON.stringify(datos));
            return true;
        } catch (error) {
            console.error(`No se pudo guardar "${clave}":`, error);
            return false;
        }
    }

    obtener(clave, valorPorDefecto = null) {
        try {
            const datos = JSON.parse(localStorage.getItem(clave));
            return datos ?? valorPorDefecto;
        } catch (error) {
            return valorPorDefecto;
        }
    }

    eliminar(clave) {
        localStorage.removeItem(clave);
    }
}