import { getSignerClient } from './config';
import { KeyringPair } from '@polkadot/keyring/types';
import { ApiPromise, WsProvider, HttpProvider } from '@polkadot/api';
import { keygen } from '@analog-labs/timegraph-js';
import { waitReady } from '@polkadot/wasm-crypto';
import { TimegraphClient } from '@analog-labs/timegraph-js';

export const delay = (ms: number) =>
	new Promise(resolve => setTimeout(resolve, ms));

const genSessionKey = async () => {
	// init polkadot keypair for node env
	let keypair = await getSignerClient();
	await waitReady();

	console.log(keypair.address);
	// pass signer and address to get keygen instance
	const _keygen = new keygen({
		signer: keypair.sign,
		address: keypair.address,
	});
	// generate API key, i.e. role is optional default will be developer
	const apiKey = await _keygen.createApiKey('developer');
	console.log(apiKey);

	// generate session key
	const sessionKey = await _keygen.createSessionkey(9000); // ms
	console.log(sessionKey);

	const timeGraphClient = new TimegraphClient({
		url: 'https://timegraph.testnet.analog.one/graphql', // url to Watch GraphQL instance
		sessionKey: sessionKey.ssk, // session key created by user wallet using SDK keygen
	});
	const response1 = await timeGraphClient.user.create({
		address: keypair.address, // TODO
	});
	console.log(response1);
	const response2 = await timeGraphClient.apiKey.certify({
		cert: apiKey.cert,
	});
	console.log(response2.userId, response2.role, response2.status);

	const response3 = await timeGraphClient.apiKey.enable({ key: apiKey.key });
	console.log(response3);

	const response4 = await timeGraphClient.apiKey.revoke({ key: apiKey.key });
	console.log(response4);

	const aliasResponse = await timeGraphClient.alias.add({
		name: 'Test',
		hashId: 'QmZAKJj6ydifNX5b9wBak6MGazv2zEQYmnL6WzN6AKh55z',
	});

	console.log(aliasResponse);

	const responseuser = await timeGraphClient.user.get();
	console.log(responseuser);

	const queriedData = await timeGraphClient.view.subgraph({
		hash: 'QmZAKJj6ydifNX5b9wBak6MGazv2zEQYmnL6WzN6AKh55z',
	});
	console.log(queriedData);
	console.log(queriedData[0].references);
	console.log(JSON.stringify(queriedData[0].references));
};

async function main() {
	genSessionKey();
}

main();
