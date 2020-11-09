import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    activePage : string = 'infos';
    menuOpen : boolean = false;

    patrolTypes : Array<string> = ['P', 'PH', 'PR', 'PM', 'PB', 'PN', 'PP'];
    patrolTypesEmoji : Array<string> = ['🚓', '🚁', '🏎️', '🏍️', '🕵️', '⛵', '🚶']
    ranks : Array<string> = ['Cadet', 'Officier', 'Officier Supérieur', 'Sergent I', 'Sergent II', 'Sergent III', 'Major', 'Lieutenant I', 'Lieutenant II', 'Lieutenant III', 'Capitaine', 'Commissaire-Adjoint', 'Commissaire'];
    sectors : Array<string> = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Nord', 'Libre'];

    infos : Object = {
        startedAt: this.getHour(),
        agents: [
            {roleName : 'Chef du dispatch', rank : this.ranks[0], id : null, name : ''},
            {roleName : 'Agent de centrale', rank : this.ranks[0], id : null, name : ''},
            {roleName : 'Agent d\'accueil', rank : this.ranks[0], id : null, name : ''}
        ]
    }
    
    activePatrolType : string = this.patrolTypes[0];
    patrols : Object = {};

    sReports : Array<Object> = [];

    save : string = JSON.stringify({infos: this.infos, patrols: this.patrols, sReports: this.sReports});

    /**
     * Add a member to the patrol
     * @param pType The type of the patrol
     * @param patrol The patrol object
     */
    addMember(pType, patrol) : void {
        const pId : number = this.patrols[pType].indexOf(patrol);
        const newMember : Object = {
            addedAt: this.getHour(),
            rank : this.ranks[0],
            id : null,
            name : '',
            leave : {}
        };
        this.patrols[pType][pId].members.push(newMember);
    }

    /**
     * Add a sector to the patrol
     * @param pType The type of the patrol
     * @param patrol The patrol object
     */
    addSector(pType, patrol) : void {
        const pId : number = this.patrols[pType].indexOf(patrol);
        this.patrols[pType][pId].nbOfSectors.push(this.patrols[pType][pId].nbOfSectors.length);
        this.patrols[pType][pId].sectors.push(this.sectors[0]);
    }

    /**
     * Create a new patrol
     */
    newPatrol() : void {
        if (!this.patrols[this.activePatrolType]) {
            this.patrols[this.activePatrolType] = [];
        }
        const newPatrol : Object = {
            name: `${this.activePatrolType}${this.patrols[this.activePatrolType].length+1}`,
            nbOfSectors : [0],
            sectors: [this.sectors[0]],
            startedAt: this.getHour(),
            on: true,
            members: [],
            end: {reason: ''}
        };
        this.patrols[this.activePatrolType].push(newPatrol);
        this.addMember(this.activePatrolType, newPatrol);
    }

    /**
     * Remove the last added member of the patrol
     * @param pType The type of the patrol
     * @param patrol The patrol object
     * @param member The member object
     */
    removeMember(pType, patrol, member) : void {
        const pId : number = this.patrols[pType].indexOf(patrol);
        const mId : number = this.patrols[pType][pId].members.indexOf(member);
        const leaveArray : Object = {
            hour : this.getHour(),
            reason : ''
        };
        this.patrols[pType][pId].members[mId].leave = leaveArray;
    }

    /**
     * Changing the patrol variables to stop it
     * @param pType The type of the patrol
     * @param patrol The patrol object
     */
    stopPatrol(pType, patrol) : void {
        const pId : number = this.patrols[pType].indexOf(patrol);
        this.patrols[pType][pId].end.hour = this.getHour();
        this.patrols[pType][pId].end.value = '';
        this.patrols[pType][pId].on = false;
    }

    /**
     * Remove the last added patrol of the patrol type
     * @param pType The type oft the patrol
     */
    removeLastPatrol(pType) : void {
        this.patrols[pType].pop()
    }

    /**
     * Remove the last added member of the patrol
     * @param pType The type of the patrol
     * @param patrol The patrol object
     */
    removeLastMember(pType, patrol) : void {
        const pId = this.patrols[pType].indexOf(patrol);
        this.patrols[pType][pId].members.pop();
    }

    /**
     * Initialising the local variables to create a new situation report
     */
    newSReport() : void {
        let report = {
            hour: this.getHour(),
            patrols: []
        }
        for(let pType of this.patrolTypes) {
            if (!this.patrols[pType]) continue;
            for(let patrol of this.patrols[pType]) {
                if (!patrol.on) continue;
                report.patrols.push({name: patrol.name, value: '', typeNb : this.patrolTypes.indexOf(pType)});
            }
        }
        this.sReports.push(report);
    }

    removeLastSReport() {
        this.sReports.pop();
    }
    

    /**
     * Return the actual time under the format : 'hh:mm'
     */
    getHour() : string {
        const date = new Date();
        return `${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`
    }

    /**
     * Return the recommended hour for the next situation report
     */
    getNextReportHour() : string {
        const lastReport : object = this.sReports[this.sReports.length-1];
        if(!lastReport) return this.localHourFormatAdditions(this.infos['startedAt'], 15);
        return this.localHourFormatAdditions(lastReport['hour'], 15);
    }

    /**
     * Transform the local variables to copy/pastable text
     */
    loadSave() : void {
        this.save = 'Contenu en chargement';
        setTimeout(() => { 
            this.save = JSON.stringify({infos: this.infos, patrols: this.patrols, sReports: this.sReports});
        }, 500);
    }

    /**
     * Set the local variables equal to JSON if JSON is correct
     */
    submitSave() : void {
        let parseResult : Object;
        try {
            parseResult = JSON.parse(this.save);
            this.patrols = parseResult['patrols'];
            this.infos = parseResult['infos'];
            this.sReports = parseResult['sReports'];
            
            this.save = 'Contenu chargé';
            setTimeout(() => {
                this.loadSave();
            }, 1000);
        } catch {
            this.save = 'Contenu invalide';
            setTimeout(() => {
                this.loadSave();
            }, 1000);
        }
        
    }

    /**
     * Return a string value equal to the initialHour string + minutesMore number
     * @param initialHour The initial time format 'hh:mm'
     * @param minutesMore The minutes to add
     */
    localHourFormatAdditions(initialHour : string, minutesMore : number) : string {
        let minutes : any = parseInt(initialHour.slice(-2)) + minutesMore;
        let hours : any = parseInt(initialHour.substring(0, 2));
        if (minutes >= 60) {
            hours++;
            minutes -= 60;
        }
        minutes = ('0' + minutes).slice(-2);
        if (hours >= 24) {
            hours -= 24;
        }
        hours = ('0' + hours).slice(-2);
        return `${hours}:${minutes}`;
    }

    compareHour(hour1 : string, hour2 : string, timeGap : number) : boolean {
        let hour1Obj : object = {
            minutes: parseInt(hour1.slice(-2)),
            hour: parseInt(hour1.substring(0, 2))
        }
        let hour2Obj : object = {
            minutes: parseInt(hour2.slice(-2)),
            hour: parseInt(hour2.substring(0, 2))
        }
        if (hour1Obj['hour'] > hour2Obj['hour']) return false;
        if (hour2Obj['minutes'] - hour1Obj['minutes'] <= timeGap) return false;
        else return true;
    }
}
