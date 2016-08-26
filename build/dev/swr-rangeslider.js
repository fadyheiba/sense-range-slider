define( [
    'jquery',
    'underscore',
    'angular',
    'qvangular',
    'qlik',
    './properties',
    './initialproperties',
    'text!./swr-slider.ng.html',

    // No return values
    './lib/external/angular-rangeslider/angular.rangeSlider'
],
       function ( $, _, angular, qvangular, qlik, props, initprops, ngTemplate ) {
    'use strict';

    return {

        definition: props,
        initialProperties: initprops,
        template: ngTemplate,
        snapshot: {canTakeSnapshot: false},
        controller: ['$scope', '$element', function ( $scope, $element ) {

            var opts = $scope.sliderOpts = {
                orientation: 'horizontal',
                step: 1,
                rangeMin: 0,
                rangeMax: 100,
                min: 0,
                max: 100,
                disabled: false,
                minVar: null,
                maxVar: null,
                preventEqualMinMax: true,
                pinHandle: '',
                moveValuesWithHandles: false,
                sliderColor: '#2f96b4'
            };

            //Todo: prop for disabled
            opts.step = $scope.layout.props.step;
            opts.rangeMin = $scope.layout.props.rangeMin;
            opts.rangeMax = $scope.layout.props.rangeMax;
            opts.orientation = $scope.layout.props.orientation;
            opts.sliderColor = $scope.layout.props.sliderColor;

            $scope.$watch( 'layout.props.enabled', function ( newVal, oldVal ) {
                if ( newVal !== oldVal ) {
                    opts.disabled = !newVal;
                }
            } );

            $scope.$watch( 'layout.props.pinHandle', function ( newVal, oldVal ) {
                if ( newVal !== oldVal ) {
                    opts.pinHandle = newVal;
                }
            } );

            $scope.$watch( 'layout.props.moveValuesWithHandles', function ( newVal, oldVal ) {
                if ( newVal !== oldVal ) {
                    opts.moveValuesWithHandles = newVal;
                }
            } );

            $scope.$watch( 'layout.props.step', function ( newVal, oldVal ) {
                if ( newVal !== oldVal ) {
                    opts.step = newVal || 1;
                }
            } );

            $scope.$watch('layout.props.preventEqualMinMax', function (newVal, oldVal) {
                if ( newVal !== oldVal ) {
                    opts.step = newVal || 1;
                }
            });

            $scope.$watch( 'layout.props.rangeMin', function ( newVal, oldVal ) {
                if ( newVal !== oldVal ) {
                    opts.preventEqualMinMax = newVal;
                }
            } );

            $scope.$watch( 'layout.props.rangeMax', function ( newVal, oldVal ) {
                if ( newVal !== oldVal ) {
                    opts.rangeMax = newVal || 100;
                }
            } );
            $scope.$watch( 'layout.props.orientation', function ( newVal, oldVal ) {
                if ( newVal !== oldVal ) {
                    console.log( 'new orientation', newVal );
                    opts.orientation = newVal;
                }
            } );

            $scope.$watch( 'sliderOpts.min', function ( newVal, oldVal ) {

                if ( parseFloat( newVal ) !== parseFloat( oldVal ) ) {
                    getApp().variable.setContent( '' + getMinVar() + '', '' + newVal + '' )
                        .then( function ( data ) {
                        angular.noop();
                    }, function ( err ) {
                        if ( err ) {
                            //Todo: Think of error handling
                            window.console.log( 'error', err );
                        }
                    } );
                }
            } );
            $scope.$watch( 'sliderOpts.max', function ( newVal, oldVal ) {
                if ( parseFloat( newVal ) !== parseFloat( oldVal ) ) {
                    getApp().variable.setContent( '' + getMaxVar() + '', '' + newVal + '' );
                }
            } );

            $scope.$watch( 'layout.props.sliderColor', function ( newVal, oldVal ) {
                //Sloppy code for now
                for(var i=0; i<document.styleSheets.length; i++){
                    if(document.styleSheets[i].ownerNode.sheet.cssRules[0]){
                        if(document.styleSheets[i].ownerNode.sheet.cssRules[0].selectorText == ".ngrs-range-slider"){ 
                            var rangeSliderStyleSheet = document.styleSheets[i];
                        }
                    }
                }
                var backgroundColor = "background-color:";
                rangeSliderStyleSheet.addRule('.ngrs-range-slider .ngrs-join', backgroundColor.concat(opts.sliderColor,";"));
                
                if ( newVal !== oldVal ) {
                    opts.sliderColor = newVal;
                    rangeSliderStyleSheet.addRule('.ngrs-range-slider .ngrs-join', backgroundColor.concat(opts.sliderColor,";"));
                }
            } );


            function getApp () {
                return qlik.currApp();
            }

            function getMinVar () {
                return $scope.layout.props.varMin;
            }

            function getMaxVar () {
                return $scope.layout.props.varMax;
            }

            function loadVal ( varName, target ) {

                if ( varName ) {
                    getApp().variable.getContent( varName )
                        .then( function ( data ) {
                        if ( data && data.qContent && data.qContent.qIsNum ) {
                            $scope.sliderOpts[target] = data.qContent.qString;
                        }
                    }, function ( err ) {
                        window.console.error( err ); //Todo: Think of error handling and how to expose to the UI
                    } )
                }
            }

            $scope.resizeObj = function ( $elem ) {
                console.log( 'container height', $elem.parent().height() );
                if ( $elem && $elem.length ) {
                    var $target = $elem.find( '.ngrs-runner' );
                    if ( $scope.layout.props.orientation.indexOf('vertical') > -1 ) {
                        console.log('change height');
                        $target.height( $elem.parent().height() - 50 );
                    } else {
                        $target.height('');
                    }
                }
            };

            $scope.init = function () {
                loadVal( getMinVar(), 'min' );
                loadVal( getMaxVar(), 'max' );
                $scope.resizeObj( $element );

            };
            $scope.init();


        }],
        paint: function ( $element /*,layout*/ ) {
            this.$scope.resizeObj( $element );
        },
        resize: function ( $element ) {
            this.$scope.resizeObj( $element );
        }
    };
} );