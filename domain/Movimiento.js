// Capa: Dominio
// Representa una única operación (retiro o consignación) sobre una Cuenta.

export class Movimiento {
    constructor(tipo, monto, saldoResultante, responsable = "titular") {
        this.tipo = tipo;               // "Retiro" | "Consignación"
        this.monto = monto;
        this.fecha = new Date();
        this.saldo = saldoResultante;
        // Quién ejecutó la operación: el propio titular o un cajero que lo atendió.
        // Esto sirve como rastro de auditoría cuando un Cajero opera la cuenta.
        this.responsable = responsable;
    }
}