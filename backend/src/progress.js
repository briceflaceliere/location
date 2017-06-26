var Subject = require('rxjs/Subject').Subject;


module.exports.init = function(providers) {
    var progress = {progress: 0, city: 0, providers: []};
    var steps = {city: 100};

    for (var i in providers) {
        var name = providers[i].name;
        progress.providers.push({name: name, progress: 0});
        steps[name] = 100;
    }

    return {
        onProgressEvent: new Subject(),
        progress: progress,
        steps: steps,
        emitProgress: function() {
            console.log(this.progress);
            var providerProgress = 100 / (this.progress.providers.length + 1);
            var cityProgress = 100 - (providerProgress * this.progress.providers.length);

            this.progress.progress = ((cityProgress / 100) * this.progress.city);
            for (var i in progress.providers) {
                this.progress.progress += ((providerProgress / 100) * this.progress.providers[i].progress)
            }

            this.onProgressEvent.next(this.progress);
            return this;
        },
        setMax: function (name, max) {
            this.steps[name] = 100 / max;
            return this;
        },
        next: function(name) {
            var step = this.steps[name];

            if (name == 'city') {
                this.progress.city += step;
            } else {
                for (var i in this.progress.providers) {
                    if (this.progress.providers[i].name == name) {
                        this.progress.progress[i].progress += step;
                    }
                }
            }
            this.emitProgress();
            return this;
        },
        done: function(name) {
            if (name == 'city') {
                this.progress.city = 100;
            } else {
                this.progress.progress[i].progress = 100;
            }
            this.emitProgress();
            return this;
        }
    };
};
