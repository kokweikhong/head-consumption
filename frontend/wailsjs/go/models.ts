export namespace main {
	
	export class HeadConsumptionData {
	    date: string;
	    shift: string;
	    headType: string;
	    headSurface: string;
	    quantity: number;
	    type: string;
	
	    static createFrom(source: any = {}) {
	        return new HeadConsumptionData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.date = source["date"];
	        this.shift = source["shift"];
	        this.headType = source["headType"];
	        this.headSurface = source["headSurface"];
	        this.quantity = source["quantity"];
	        this.type = source["type"];
	    }
	}
	export class headTypePlotData {
	    headType: string;
	    headSurface: string;
	    manualQty: number[];
	    databaseQty: number[];
	
	    static createFrom(source: any = {}) {
	        return new headTypePlotData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.headType = source["headType"];
	        this.headSurface = source["headSurface"];
	        this.manualQty = source["manualQty"];
	        this.databaseQty = source["databaseQty"];
	    }
	}
	export class HeadConsumptionPlotData {
	    dates: string[];
	    data: {[key: string]: headTypePlotData};
	
	    static createFrom(source: any = {}) {
	        return new HeadConsumptionPlotData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.dates = source["dates"];
	        this.data = source["data"];
	    }
	}

}

