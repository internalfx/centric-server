# Centric Server

### A programmable automation server

## Installation

### Install centric-server

Clone the centric-server using command.

```
$ git clone git@github.com:internalfx/centric-server.git
```

### Install centric-scaffold

#### Option 1
Clone the centric-scaffold using command.

```
$ git clone git@github.com:internalfx/centric-scaffold.git
```

#### Option 2

Folder Structure for centric-scaffold.

```
    .
    ├── services                   # Services folder having service files
    ├── tasks                      # Tasks folder having task files to be listed in the centric task page.
    ├── config.js                  # Configuration file containing the config json having properties like baseURL, services (array of service file name).

```

## Setup

To run this project, follow the command:

```
```

## Services

The services folder in the centric-scaffold contains the service file which accepts the config property and contains the required logic.

`i.e`
```
module.exports = async function ({ config }) {
  // Service Logic goes here...
  const testLogging = function () {
    console.log('this is a test')
  }

  return {
    testLogging
  }
}
```
The service could be used to establish connection instance with the database, query the database, provide some common service logic.


## Creating a new task

Create new task file in centric-scaffold under tasks folder which looks like : 

`The name of the task is equivalent to the name of the task file name.`

```
module.exports = {
  description: <Description for the task>(String),
  locks: null,
  defaultData: function () {
    // Return the default data for the task.
    // It will be taken by default as the "taskData" in the run method.
    return {}
  },
  run: async function ({ config, services, opData, saveOpData, taskData, saveTaskData, logInfo, logWarning, logError, isCancelled }) {
    // Run method is called when the task runs according to the scheduled time.
    // Logic for the task goes here.
  }
}
```

The run method provides following listed parameters:
```
config       : config json exported from config.js.
services     : list of all the services.
opData       : Current running task's operation-data.
saveOpData   : Method to be called to save the curremt operation data.
taskData     : Task data of the current running task.
saveTaskData : Method to be called to save the current running task data. 
logInfo      : logInfo is method to log the info entry showing information log of the operation.
logWarning   : logWarning is method to log the warnings entry showing warnings of the operation.
logError     : logError is method to log the errors entry showing errors of the operation.
isCancelled  : Method to check whether the task is active for running or has been cancelled.
```

The screen-shot below shows the list of tasks under the task folder in centric-scaffold.
![Tasks](https://raw.githubusercontent.com/internalfx/centric-server/readme-documentation/resources/screenshot_tasks.png)

### Schedule a task

Go to the tasks list page and click over the task item for which need to schedule a task and follow the following steps:

1. Enable the task
2. Click over the Create Schedule button
![Tasks-Schedule](https://raw.githubusercontent.com/internalfx/centric-server/readme-documentation/resources/screenshot_taskSchedule1.png)
1. Create Schdule form page will be rendered.
   Add new schedule detail:- 
    Name: Name of the schedule,
    cronTime: Time interval to determine how often to run the task,
    data: Operation data for the task's individual operation.
   And Enable the schedule to make it active.
2. Click over the Save button.
![Tasks-Schedule](https://raw.githubusercontent.com/internalfx/centric-server/readme-documentation/resources/screenshot_taskSchedule2.png)


## Creating a new user

Select Users menu from home page, users list page looks like
![Users](https://raw.githubusercontent.com/internalfx/centric-server/master/resources/screenshot_users.png)

To create new user click over "CREATE USER" button and add the detail of the user to be created.

## Task History

The task processed are listed in the history menu under sidemenu list.
![History](https://raw.githubusercontent.com/internalfx/centric-server/master/resources/screenshot_history.png)

- It provides the list of task operations processed with following details.
  - Operation Number.
  - Task name of respective operation.
  - Status of the operation (i.e) Completed, Terminated, Active, Failed, Cancelled.
  - Run date of the operation.
  - Entry count: The number of logs written while the processing of the task operation.
  - Last entry message and data.

## Dashboard

The dashboard page provides the list of currently running task detail.

![Dashboard](https://raw.githubusercontent.com/internalfx/centric-server/master/resources/screenshot_dashboard.png)
