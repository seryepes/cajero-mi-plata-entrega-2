// Capa: Dominio
// Administrador gestiona el sistema: crea cajeros, bloquea usuarios y
// consulta reportes globales. No opera cuentas directamente.

import { Persona } from "./persona.js";

export class Administrador extends Persona {
    constructor(nombre, id, correo, contrasenia) {
        super(nombre, id, correo, contrasenia);
    }

    get rol() { return "administrador"; }

    // Estos métodos delegan en el Banco, que es quien conoce las listas
    // completas de usuarios/cajeros y la persistencia.
    crearCajero(banco, datosCajero) {
        return banco.registrarCajero(datosCajero);
    }

    eliminarCajero(banco, idCajero) {
        return banco.eliminarCajero(idCajero);
    }

    bloquearUsuario(usuario) {
        usuario.bloquear();
    }

    desbloquearUsuario(usuario) {
        usuario.desbloquear();
    }

    generarReporteGeneral(banco) {
        return banco.generarReporte();
    }
}