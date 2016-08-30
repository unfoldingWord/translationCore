//File that is meant to be provided with the save
//bible project component so that checker can be aware
//when they save their progress throughout

var TimeStamp = {
  getInitialState: function() {
    var moment = new Date();
    var time;
    var date = [moment.getMonth(), moment.getDate(), moment.getFullYear()];
    var Hours = [moment.getHours(), moment.getMinutes()];
    var nightday = 'AM';

    date[0] = date[0] + 1;
    if (Hours[0] >= 12)
    {
      Hours[0] = Hours[0] - 12;
      nightday = "PM";
    }

    if (Hours[1] < 10)
    {
      Hours[1] = "0" + Hours[1];
    }
    if (Hours[0] == 0)
    {
      Hours[0] = "12";
    }
    this.time = (date[0] + "/" + date[1] + "/" + date[2] + " " + Hours[0] + ":" + Hours[1] + " " + nightday)
  },
  CreateTimeStamp: function() {
    var now;
    var time = new Date();
    var nightday = "AM";
    var day = [time.getMonth(), time.getDate(), time.getFullYear()];
    var hrs = [time.getHours(), time.getMinutes()];
    day[0] = day[0] + 1;
    if (hrs[0] >= 12)
    {
      hrs[0] = hrs[0] -12;
      nightday = "PM";
    }

    if (hrs[1] < 10)
    {
      hrs[1] = "0" + hrs[1];
    }
    if (hrs[0] == 0)
    {
      hrs[0] = "12";
    }
    now = (day[0] + "/" + day[1] + "/" + day[2] + " " + hrs[0] + ":" + hrs[1] + " " + nightday);


    if (!(this.time == now))
    {
      this.time = now;
      return (now);
    }
    else
    {
      return (this.time);
    }

  },

  generate: function() {
    this.getInitialState();
    var data = this.time;

    //File Created in directory to store the timestamps throughout the created project
    var funct = ["TimeStamp: ", this.CreateTimeStamp().toString()];
    if (typeof ar === undefined)
    {
      var count;
      count = 0;
      var arr = funct.slice(0);
    }
    funct.push("\r\n");
    funct.push("\n");

    if (count > 1)
    {
      arr = arr.concat(funct);
      var output = arr.concat(funct);
      funct = output.slice(0);
    }

    count ++;
    return funct;
  }
}


module.exports = TimeStamp;
