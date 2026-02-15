import { _decorator, Component, Button,AudioSource, CCString } from 'cc';
import { AdManager } from './AdManager';
import { ButtonBehavior } from './ButtonBehavior';
const { ccclass, property } = _decorator;



@ccclass('ClickRedirect')
export class ClickRedirect extends Component {
    @property({ type: ButtonBehavior })
    button: ButtonBehavior = null!;

    @property(CCString)
    IosLink : string = "";

    @property(CCString)
    PlayStoreLink : string = "";

    start() {
        this.button.node.on(ButtonBehavior.EventType.CLICK, this.onClick, this);
    }

    public onClick() {

        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || navigator.userAgent.includes("Macintosh");
        const isAndroid = /Android/i.test(navigator.userAgent);

        const appStoreURL = this.IosLink;
        const playStoreURL = this.PlayStoreLink;

        const targetURL = isIOS ? appStoreURL : playStoreURL;

        
        AdManager.openStore(targetURL);
    }
}
