<script>
    import Productos from './routes/Productos.svelte';
    import Clientes from './routes/Clientes.svelte';
    import Pedidos from './routes/Pedidos.svelte';

    let currentRoute = '/productos';

    const navigate = (route) => {
        currentRoute = route;
    };
</script>

<nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
    <div class="container-fluid">
        <!-- svelte-ignore a11y-invalid-attribute -->
        <a class="navbar-brand" href="#" on:click={() => navigate('/productos')}>Gestión Empresarial</a>
        <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
        >
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <button
                        class="nav-link btn {currentRoute === '/productos' ? 'active' : ''}"
                        on:click={() => navigate('/productos')}
                    >
                        Productos
                    </button>
                </li>
                <li class="nav-item">
                    <button
                        class="nav-link btn {currentRoute === '/clientes' ? 'active' : ''}"
                        on:click={() => navigate('/clientes')}
                    >
                        Clientes
                    </button>
                </li>
                <li class="nav-item">
                    <button
                        class="nav-link btn {currentRoute === '/pedidos' ? 'active' : ''}"
                        on:click={() => navigate('/pedidos')}
                    >
                        Pedidos
                    </button>
                </li>
            </ul>
        </div>
    </div>
</nav>

<main class="container mt-4">
    {#if currentRoute === '/productos'}
        <Productos />
    {:else if currentRoute === '/clientes'}
        <Clientes />
    {:else if currentRoute === '/pedidos'}
        <Pedidos />
    {/if}
</main>

<style>
    .navbar .nav-link {
        margin-right: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        transition: background-color 0.2s;
    }

    .navbar .nav-link.active {
        background-color: #007bff;
        color: white;
    }

    .navbar .nav-link:hover {
        background-color: #0056b3;
        color: white;
    }
</style>
