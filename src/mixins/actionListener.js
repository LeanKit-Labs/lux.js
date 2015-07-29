"use strict";
/*********************************************
*            Action Listener Mixin           *
**********************************************/
import { actionChannel } from "../bus";
import { ensureLuxProp } from "../utils";
import { generateActionCreator, addToActionGroup } from "../actions";
export function actionListenerMixin( { handlers, handlerFn, context, channel, topic } = {} ) {
	return {
		setup() {
			context = context || this;
			const __lux = ensureLuxProp( context );
			const subs = __lux.subscriptions;
			handlers = handlers || context.handlers;
			channel = channel || actionChannel;
			topic = topic || "execute.*";
			handlerFn = handlerFn || ( ( data, env ) => {
				const handler = handlers[ data.actionType ];
				if ( handler ) {
					handler.apply( context, data.actionArgs );
				}
			} );
			if ( !handlers || !Object.keys( handlers ).length ) {
				throw new Error( "You must have at least one action handler in the handlers property" );
			} else if ( subs && subs.actionListener ) {
				return;
			}
			subs.actionListener = channel.subscribe( topic, handlerFn ).context( context );
			const handlerKeys = Object.keys( handlers );
			generateActionCreator( handlerKeys );
			if ( context.namespace ) {
				addToActionGroup( context.namespace, handlerKeys );
			}
		},
		teardown() {
			this.__lux.subscriptions.actionListener.unsubscribe();
		}
	};
}
