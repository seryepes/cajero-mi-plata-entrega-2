// Capa: Dominio
// Cajero es un empleado del banco: no tiene cuenta propia, pero puede operar
// la cuenta de un Usuario en su nombre (retiro/consignación presencial).

import { Persona } from "./persona.js";

export class Cajero extends Persona {
    constructor(nombre, id, correo, contrasenia, codigoEmpleado) {
        super(nombre, id, correo, contrasenia);
        this.codigoEmpleado = codigoEmpleado;
    }

    get rol() { return "cajero"; }

    // Todas estas operaciones se delegan a la Cuenta del usuario atendido,
    // pero quedan registradas con el nombre del cajero como responsable.
    atenderRetiro(usuario, monto) {
        return usuario.cuenta.retirar(monto, `Cajero ${this.nombre}`);
    }

    atenderConsignacion(usuario, monto) {
        return usuario.cuenta.consignar(monto, `Cajero ${this.nombre}`);
    }

    consultarSaldoCliente(usuario) {
        return usuario.consultarSaldo();
    }

    toJSON() {
        return { ...super.toJSON(), codigoEmpleado: this.codigoEmpleado };
    }
}