import { Injectable } from '@angular/core';


@Injectable()
export class CitiesService {

    public cities = {};

    public zipcodes = {};

    public add(city)
    {
        this.cities[city._id] = city;
        if (this.zipcodes[city.zipcode] == undefined) {
            this.zipcodes[city.zipcode] = [];
        }
        this.zipcodes[city.zipcode].push(city._id);
    }

    public get(id)
    {
        return this.cities[id];
    }

    public getByZipcode(zipcode)
    {
        return this.zipcodes[zipcode];
    }
    
    public clear()
    {
        this.zipcodes = {};
        this.cities = {};
    }
}