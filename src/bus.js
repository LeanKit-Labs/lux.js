import postal from "postal";

const actionChannel = postal.channel( "lux.action" );
const storeChannel = postal.channel( "lux.store" );
const dispatcherChannel = postal.channel( "lux.dispatcher" );

export {
	actionChannel,
	storeChannel,
	dispatcherChannel,
	postal
};
