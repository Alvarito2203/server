<script>
    import { onMount } from "svelte";

    let clientes = [];
    let nombre = "";
    let email = "";
    let editId = null;

    // Leer clientes
    const fetchClientes = async () => {
        const res = await fetch("http://localhost:3000/clientes");
        clientes = await res.json();
    };

    // Crear cliente
    const agregarCliente = async () => {
    if (!nombre || !email) {
        alert("Por favor, completa todos los campos.");
        return;
    }
    await fetch("http://localhost:3000/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email }),
    });
    fetchClientes(); // Recargar clientes después de agregar
    limpiarFormulario();
};


    // Actualizar cliente
    const actualizarCliente = async () => {
    if (!nombre || !email) {
        alert("Por favor, completa todos los campos.");
        return;
    }
    await fetch(`http://localhost:3000/clientes/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email }),
    });
    fetchClientes(); // Recargar clientes después de actualizar
    limpiarFormulario();
};

    // Eliminar cliente
    const eliminarCliente = async (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
        await fetch(`http://localhost:3000/clientes/${id}`, {
            method: "DELETE",
        });
        fetchClientes(); // Recargar clientes después de eliminar
    }
};

    // Seleccionar cliente para editar
    const seleccionarCliente = (cliente) => {
        editId = cliente.id;
        nombre = cliente.nombre;
        email = cliente.email;
    };

    const limpiarFormulario = () => {
        editId = null;
        nombre = "";
        email = "";
    };

    onMount(() => {
        fetchClientes();
    });
</script>

<main>
    <h1>Gestión de Clientes</h1>

    <form on:submit|preventDefault={editId ? actualizarCliente : agregarCliente}>
        <input bind:value={nombre} placeholder="Nombre" required />
        <input bind:value={email} type="email" placeholder="Email" required />
        <button type="submit">{editId ? "Actualizar" : "Agregar"}</button>
        {#if editId}
            <button type="button" on:click={limpiarFormulario}>Cancelar</button>
        {/if}
    </form>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {#each clientes as cliente}
                <tr>
                    <td>{cliente.id}</td>
                    <td>{cliente.nombre}</td>
                    <td>{cliente.email}</td>
                    <td>
                        <button on:click={() => seleccionarCliente(cliente)}>Editar</button>
                        <button on:click={() => eliminarCliente(cliente.id)}>Eliminar</button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</main>
