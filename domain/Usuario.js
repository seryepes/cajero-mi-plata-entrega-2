// Capa: Dominio
// Usuario es el cliente del banco. Hereda los datos personales de Persona
// y compone una Cuenta (una Usuario "tiene una" Cuenta, no "es una" Cuenta).

import { Persona } from "./persona.js";
import { Cuenta } from "./Cuenta.js";

export class Usuario extends Persona {
    constructor(nombre, id, correo, contrasenia, saldoInicial = 0, producto = "Cuenta de ahorros") {
        super(nombre, id, correo, contrasenia);
        this.cuenta = new Cuenta(Usuario.generarNumeroCuenta(id), saldoInicial);
        this.producto = producto;
        this.activo = true; // un administrador puede bloquear la cuenta
    }

    static generarNumeroCuenta(id) {
        return `CTA-${id}-${Date.now().toString().slice(-4)}`;
    }

    get rol() { return "usuario"; }

    get saldo() { return this.cuenta.saldo; }
    get movimientos() { return this.cuenta.movimientos; }

    retirar(monto) {
        return this.activo ? this.cuenta.retirar(monto, this.nombre) : false;
    }

    consignar(monto) {
        return this.activo ? this.cuenta.consignar(monto, this.nombre) : false;
    }

    consultarSaldo() {
        return this.cuenta.consultarSaldo();
    }

    obtenerHistorial() {
        return this.cuenta.obtenerMovimientos();
    }

    bloquear() { this.activo = false; }
    desbloquear() { this.activo = true; }

    toJSON() {
        return {
            ...super.toJSON(),
            activo: this.activo,
            producto: this.producto,
            cuenta: this.cuenta.toJSON()
        };
    }
}