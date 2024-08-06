<script>
	import { Router, Link, Route, navigate } from "svelte-routing";
	export let url = "";
	import { slide } from 'svelte/transition';
	import { pb } from './services/pocketbase';
	import { onMount } from 'svelte';
	import Home from "./routes/Home.svelte";
	import Contracts from "./routes/Contracts.svelte";
	import Login from "./routes/Login.svelte";
	import NewContract from "./routes/NewContract.svelte";
	import ContractDetails from "./routes/ContractDetails.svelte";
	import Header from "./components/Header.svelte";
	import Footer from "./components/Footer.svelte";
	import Terms from "./routes/Terms.svelte";
	import Privacy from "./routes/Privacy.svelte";
  
	// Import icons
	import { FaHome, FaFileContract, FaPlusCircle } from 'svelte-icons/fa';
	
	const base = '';
	let isAuthenticated = pb.authStore.isValid;
	let userRole = pb.authStore.model?.role || '';
	let isNavExpanded = false;
  
	import { ensureWalletExists } from './services/walletService';
  
	async function createWalletIfNeeded() {
	  if (pb.authStore.isValid && !pb.authStore.model.wallet) {
		try {
		  await ensureWalletExists(pb.authStore.model.id);
		} catch (error) {
		  console.error('Failed to create wallet:', error);
		  alert('Failed to create wallet: ' + error.message);
		}
	  }
	}
  
	onMount(() => {
	  pb.authStore.onChange((auth) => {
		isAuthenticated = auth !== null;
		userRole = auth?.model?.role || '';
		if (isAuthenticated) {
		  createWalletIfNeeded();
		}
	  });
	});
  
	function isNewContractDisabled() {
	  return userRole === 'DataProvider';
	}
  
	function handleNewContractAction(event) {
	  if (!isNewContractDisabled()) {
		navigate('/new-contract');
	  }
	}
  </script>

<Router {url} basepath={base}>
  {#if isAuthenticated}
    <div class="flex flex-grow pt-16 pb-16"> 
      <Header />
      <div class="flex flex-grow">
        <nav 
          class="fixed left-0 top-16 bottom-16 z-10 bg-gradient-to-r from-gray-100 to-transparent transition-all duration-500 ease-in-out overflow-hidden flex flex-col justify-center"
          class:w-32={isNavExpanded}
          class:w-16={!isNavExpanded}
          on:mouseenter={() => isNavExpanded = true}
          on:mouseleave={() => isNavExpanded = false}
        >
          <ul class="space-y-8">
            <li>
              <Link to="/" class="flex items-center p-2 rounded hover:bg-white hover:bg-opacity-50 w-full">
                <div class="w-8 h-8 flex-shrink-0 mx-auto">
                  <FaHome />
                </div>
                <span class="ml-4 whitespace-nowrap overflow-hidden" class:w-0={!isNavExpanded} class:w-auto={isNavExpanded} transition:slide={{duration: 500, axis: 'x'}}>
                  Home
                </span>
              </Link>
            </li>
            <li>
              <Link to="/contracts" class="flex items-center p-2 rounded hover:bg-white hover:bg-opacity-50 w-full">
                <div class="w-8 h-8 flex-shrink-0 mx-auto">
                  <FaFileContract />
                </div>
                <span class="ml-4 whitespace-nowrap overflow-hidden" class:w-0={!isNavExpanded} class:w-auto={isNavExpanded} transition:slide={{duration: 500, axis: 'x'}}>
                  Contracts
                </span>
              </Link>
            </li>
            <li>
              <button 
                type="button"
                class="flex items-center p-2 rounded hover:bg-white hover:bg-opacity-50 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                class:opacity-50={isNewContractDisabled()}
                class:cursor-not-allowed={isNewContractDisabled()}
                on:click={handleNewContractAction}
                on:keydown={(e) => e.key === 'Enter' && handleNewContractAction(e)}
                disabled={isNewContractDisabled()}
                aria-label="New Contract"
              >
                <div class="w-8 h-8 flex-shrink-0 mx-auto">
                  <FaPlusCircle />
                </div>
                <span class="ml-4 whitespace-nowrap overflow-hidden" class:w-0={!isNavExpanded} class:w-auto={isNavExpanded} transition:slide={{duration: 500, axis: 'x'}}>
                  New Contract
                </span>
              </button>
            </li>
          </ul>
        </nav>
        <main class="flex-grow p-4 bg-gray-50 ml-16 mt-16 mb-16">
          <Route path="/" component={Home} />
          <Route path="/contracts" component={Contracts} />
          <Route path="/contract/:id" component={ContractDetails} />
          <Route path="/new-contract" component={NewContract} />
          <Route path="/terms" component={Terms} />
          <Route path="/privacy" component={Privacy} />
        </main>
      </div>
      <Footer />
    </div>
  {:else}
    <Route path="*" component={Login} />
  {/if}
</Router>
  <style>
	:global(body) {
	  margin: 0;
	  padding: 0;
	}
	:global(svg) {
	  width: 100%;
	  height: 100%;
	}
	:global(header), :global(footer) {
	  position: fixed;
	  left: 0;
	  right: 0;
	  z-index: 20;
	}
	:global(header) {
	  top: 0;
	}
	:global(footer) {
	  bottom: 0;
	}
	
  </style>
  