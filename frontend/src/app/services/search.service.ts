import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

declare var io: any;

@Injectable()
export class SearchService {

    protected socket;

    public searchProgressEvent = new Subject();

    public addCityEvent = new Subject();

    public resultsEvent = new Subject();

    public connect(url)
    {
        let that = this;
        console.log('socket connect');

        this.socket = io(url);

        this.socket.on('search-progress', function(progress){
            progress.progress = Math.floor(progress.progress);
            that.searchProgressEvent.next(progress)
        });

        this.socket.on('city', function(city){
            that.addCityEvent.next(city)
        });

        this.socket.on('results', function(results){
            that.resultsEvent.next(results);
        });
    }

    public search(data)
    {
        this.socket.emit('search', data);
    }
}