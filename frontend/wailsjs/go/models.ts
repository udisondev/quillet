export namespace domain {
	
	export class Message {
	    id: string;
	    chatID: string;
	    senderID: string;
	    content: string;
	    timestamp: number;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new Message(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.chatID = source["chatID"];
	        this.senderID = source["senderID"];
	        this.content = source["content"];
	        this.timestamp = source["timestamp"];
	        this.status = source["status"];
	    }
	}
	export class Contact {
	    publicID: string;
	    publicKey: string;
	    displayName: string;
	    avatarPath: string;
	    isOnline: boolean;
	    isBlocked: boolean;
	    lastSeen: number;
	    addedAt: number;
	
	    static createFrom(source: any = {}) {
	        return new Contact(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.publicID = source["publicID"];
	        this.publicKey = source["publicKey"];
	        this.displayName = source["displayName"];
	        this.avatarPath = source["avatarPath"];
	        this.isOnline = source["isOnline"];
	        this.isBlocked = source["isBlocked"];
	        this.lastSeen = source["lastSeen"];
	        this.addedAt = source["addedAt"];
	    }
	}
	export class ChatSummary {
	    contactID: string;
	    contact: Contact;
	    lastMessage?: Message;
	    unreadCount: number;
	
	    static createFrom(source: any = {}) {
	        return new ChatSummary(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.contactID = source["contactID"];
	        this.contact = this.convertValues(source["contact"], Contact);
	        this.lastMessage = this.convertValues(source["lastMessage"], Message);
	        this.unreadCount = source["unreadCount"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class Settings {
	    theme: string;
	    notificationsOn: boolean;
	    soundOn: boolean;
	    showMessagePreview: boolean;
	    sidebarWidth: number;
	
	    static createFrom(source: any = {}) {
	        return new Settings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.theme = source["theme"];
	        this.notificationsOn = source["notificationsOn"];
	        this.soundOn = source["soundOn"];
	        this.showMessagePreview = source["showMessagePreview"];
	        this.sidebarWidth = source["sidebarWidth"];
	    }
	}
	export class User {
	    publicID: string;
	    publicKey: string;
	    displayName: string;
	    avatarPath: string;
	    createdAt: number;
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.publicID = source["publicID"];
	        this.publicKey = source["publicKey"];
	        this.displayName = source["displayName"];
	        this.avatarPath = source["avatarPath"];
	        this.createdAt = source["createdAt"];
	    }
	}

}

