

class DashboardController {
  //  /*private*/ _widgets//: any;

  //  /*public*/ groups//: any;

    /*public*/ constructor(
        $scope
    ) {
        // Initial test data

        $scope._widgets = [
            {
                type: 'picture-slider',
                animationType: 'carousel',
                animationInterval: 8000,
                size: {
                    colSpan: 2,
                    rowSpan: 2
                },
                title: 'Madrid',
                slides: [{
                        image: 'https://images.trvl-media.com/media/content/shared/images/travelguides/destination/178281/Madrid-26512.jpg',
                        text: 'is the capital city of Spain and the largest municipality in both the Community of Madrid and the Kingdom of Spain.'
                    },
                    {
                        image: 'https://www.centauro.net/uploads/alquiler-coche-madrid-debod-centauro-rent-a-car.jpg',
                        text: 'The city has a population of almost 3.2 million with a metropolitan area population of approximately 6.5 million.' +
                            'It is the third-largest city in the European Union, after London and Berlin, and its metropolitan' +
                            'area is the third-largest in the European Union after those of London and Paris. The municipality itself covers an area of 604.3 km2 (233.3 sq mi).'
                    },
                    {
                        image: 'http://www.telegraph.co.uk/content/dam/Travel/Destinations/Europe/Spain/Madrid/madrid-overview-sunsetovermadrid-xlarge.jpg',
                    }
                ]
            },
            {
                type: 'notes',
                title: 'Lorem ipsum generator',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut ' +
                    'labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ' +
                    ' ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum ' +
                    ' dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia ' +
                    ' deserunt mollit anim id est laborum',
                size: {
                    colSpan: 2,
                    rowSpan: 2
                }
            },
            {
                type: 'event',
                title: 'Goal Summit in Palace of Fine Arts, SF',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut ' +
                    'labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ' +
                    ' ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum ' +
                    ' dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia ' +
                    ' deserunt mollit anim id est laborum',
                date: new Date(2017, 3, 20),
                size: {
                    colSpan: 2,
                    rowSpan: 2
                },
                image: 'https://nyoobserver.files.wordpress.com/2015/11/palace_of_fine_arts_sf_ca.jpg?quality=80'
            },
            {
                type: 'event',
                size: {
                    colSpan: 2,
                    rowSpan: 2
                },
                title: 'Champions League Final',
                date: new Date(2017, 5, 3),
                opacity: 0.4,
                text: 'Stadium "Millenium", Cardiff, Wales',
                image: 'https://s-media-cache-ak0.pinimg.com/originals/b0/8c/c9/b08cc9a80f239ef6aeb1ad8afcff4b35.jpg'
            },
            {
                type: 'statistics',
                size: {
                    colSpan: 2,
                    rowSpan: 2
                },
                series: [{
                        label: 'Completed',
                        value: 125,
                        color: '#4caf50'
                    },
                    {
                        label: 'Uncompleted',
                        value: 20,
                        color: '#fe9702'
                    },
                    {
                        label: 'Failures',
                        value: 5,
                        color: '#ef5350'
                    }
                ],
                title: 'Monthly tasks'
            }
        ];

        $scope.groups = [{
                title: 'Global information',
                source: $scope._widgets
            },
            {
                title: 'Positions',
                source: [{
                        type: 'position',
                        size: {
                            colSpan: 2,
                            rowSpan: 1
                        },
                        location: {
                            type: 'Point',
                            coordinates: [32.393603, -110.982593]
                        }
                    },
                    {
                        type: 'position',
                        size: {
                            colSpan: 2,
                            rowSpan: 2
                        },
                        locationName: 'Paris',
                        location: {
                            type: 'Point',
                            coordinates: [48.8119955, 2.2239536]
                        }
                    }
                ]
            },
            {
                title: 'Mixed and calendar widgets',
                source: [{
                        type: 'picture-slider',
                        size: {
                            colSpan: 2,
                            rowSpan: 2
                        },
                        title: 'Barcelona',
                        slides: [{
                                image: 'http://2015.phpconference.es/wp-content/uploads/2015/05/barcelona-spain-1.jpg',
                                text: 'is the capital city of the autonomous community of Catalonia in the Kingdom of Spain'
                            },
                            {
                                image: 'http://cdni.condenast.co.uk/646x430/a_c/barcelona_cnt_18mar11_iStock_b.jpg',
                            },
                            {
                                image: 'http://2015.phpconference.es/wp-content/uploads/2015/05/barcelona1.jpg',
                                text: 'Its urban area extends beyond the administrative city limits with a population of around' +
                                    ' 4.7 million people,[5] being the sixth-most populous urban area in the European Union after Paris,' +
                                    ' London, Madrid, the Ruhr area and Milan.'
                            }
                        ]
                    },
                    {
                        type: 'calendar',
                        size: {
                            colSpan: 2,
                            rowSpan: 1
                        }
                    },
                    {
                        type: 'calendar',
                        size: {
                            colSpan: 2,
                            rowSpan: 1
                        },
                        date: new Date(2017, 11, 2),
                        color: 'green'
                    },
                    {
                        type: 'calendar',
                        size: {
                            colSpan: 1,
                            rowSpan: 1
                        },
                        date: new Date(2017, 3, 1),
                        color: 'purple'
                    },
                ]
            }
        ];
    }
}


angular
    .module('app.Dashboard')
    .controller('pipDashboardSampleController', DashboardController);