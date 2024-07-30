<script>
	import { Router, Link, Route } from "svelte-routing";
	import { slide } from 'svelte/transition';
	import { pb } from './services/pocketbase';
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
	import { FaHome, FaFileContract, FaPlusCircle, FaSignOutAlt } from 'svelte-icons/fa';
	
	export let url = "";
	let isAuthenticated = pb.authStore.isValid;
	let userRole = pb.authStore.model?.role || '';
	let isNavExpanded = false;
    const basePath = process.env.BASE_PATH || "";

	pb.authStore.onChange(() => {
	  isAuthenticated = pb.authStore.isValid;
	  userRole = pb.authStore.model?.role || '';
	});
  
	function logout() {
	  pb.authStore.clear();
	}
  </script>
  
  <Router {url} basepath={basePath}>
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
			  {#if userRole === 'Customer' || userRole === 'Admin'}
				<li>
				  <Link to="/new-contract" class="flex items-center p-2 rounded hover:bg-white hover:bg-opacity-50 w-full">
					<div class="w-8 h-8 flex-shrink-0 mx-auto">
					  <FaPlusCircle />
					</div>
					<span class="ml-4 whitespace-nowrap overflow-hidden" class:w-0={!isNavExpanded} class:w-auto={isNavExpanded} transition:slide={{duration: 500, axis: 'x'}}>
					  New Contract
					</span>
				  </Link>
				</li>
			  {/if}
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