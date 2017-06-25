import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

declare var io: any;

@Injectable()
export class SearchService {

    protected socket;

    public searchProgressEvent = new Subject();

    public addCityEvent = new Subject();

    public connect(url)
    {
        console.log('socket');
        this.socket = io(url);
    }

    public search(data)
    {
        let that = this;

        this.socket.on('search-progress', function(progress){
            progress.progress = Math.floor(progress.progress);
            that.searchProgressEvent.next(progress)
        });

        this.socket.on('city', function(city){
            that.addCityEvent.next(city)
        });

        this.socket.emit('search', data);
    }
}