<script>
	import { Router, Route, navigate } from "svelte-routing";
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
	import { fade } from 'svelte/transition';
	import VerifyEmail from "./routes/VerifyEmail.svelte";
	import CheckEmail from "./routes/CheckEmail.svelte";
	
	export let url = "";
	const base = '';
	let isAuthenticated = false;
	let userRole = '';
	let user = null;
	let walletBalance = 0;
	let loading = true;
	let error = null;
    let segment = '';

	$: {
		if (typeof window !== 'undefined') {
			segment = window.location.pathname.split('/')[1];
		}
	}

	onMount(async () => {
		try {
			loading = true;
			if (pb.authStore.isValid) {
				user = pb.authStore.model;
				userRole = user.role;
				isAuthenticated = true;
				if (user.wallet) {
					const wallet = await pb.collection('Wallet').getOne(user.wallet);
					walletBalance = wallet.token_balance;
				}
				if (userRole === 'DataProvider' && window.location.pathname === '/') {
					navigate('/contracts');
				}
			}
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}

		pb.authStore.onChange((auth) => {
			isAuthenticated = auth !== null;
			userRole = auth?.model?.role || '';
			user = auth?.model;
			updateWalletBalance();
		});
	});

	async function updateWalletBalance() {
		if (user && user.wallet) {
			try {
				const wallet = await pb.collection('Wallet').getOne(user.wallet);
				walletBalance = wallet.token_balance;
			} catch (err) {
				error = 'Error fetching wallet balance';
			}
		}
	}

	function handleProfileUpdate(event) {
		user = event.detail.user;
		walletBalance = event.detail.walletBalance;
	}

	function handleError(err) {
		error = err.message;
		setTimeout(() => {
			error = null;
		}, 5000);
	}
</script>

<Router {url} basepath={base}>
	<div class="min-h-screen flex flex-col">
		{#if loading}
			<div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
				<div class="bg-white p-4 rounded-lg shadow-lg">
					<p class="text-lg font-semibold">Loading...</p>
				</div>
			</div>
		{:else if error}
			<div class="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-50" transition:fade>
				<p>{error}</p>
			</div>
		{:else if isAuthenticated}
			<Header {userRole} {user} {walletBalance} {segment} on:profileUpdate={handleProfileUpdate} />
			<main class="flex-grow p-6 bg-gray-50 mt-16">
				<div class="max-w-7xl mx-auto">
					{#key segment}
						<div in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
							{#if userRole !== 'DataProvider'}
								<Route path="/" component={Home} />
							{/if}
							<Route path="/contracts" component={Contracts} />
							<Route path="/contract/:id" component={ContractDetails} />
							{#if userRole !== 'DataProvider'}
								<Route path="/new-contract" component={NewContract} />
							{/if}
							<Route path="/terms" component={Terms} />
							<Route path="/privacy" component={Privacy} />
						</div>
					{/key}
				</div>
			</main>
			<Footer />
		{:else}
			<Route path="/verify-email" component={VerifyEmail} />
			<Route path="/check-email" component={CheckEmail} />
			<Route path="*" component={Login} />
		{/if}
	</div>
</Router>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		--bgColorMenu: #1d1d27;
		--duration: 0.7s;
	}
  
	:global(html *) {
		box-sizing: border-box;
	}

	@media (max-width: 640px) {
		main {
			padding: 1rem;
		}
	}
</style>