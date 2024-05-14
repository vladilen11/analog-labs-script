import { Keyring } from '@polkadot/keyring';
import { KeyringPair$Json } from '@polkadot/keyring/types';
import * as data from './key.json';

const Key: KeyringPair$Json = data as unknown as KeyringPair$Json;

import * as dotenv from 'dotenv';
dotenv.config();

export async function getSignerClient() {
	const keyring = new Keyring({ type: 'sr25519' });
	const system = keyring.createFromJson(Key);
	system.unlock(''); // TODO

	return system;
}
