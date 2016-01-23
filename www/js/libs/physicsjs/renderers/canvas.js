/**
 * PhysicsJS v0.7.0 - 2014-12-08
 * A modular, extendable, and easy-to-use physics engine for javascript
 * http://wellcaffeinated.net/PhysicsJS
 *
 * Copyright (c) 2014 Jasper Palfree <jasper@wellcaffeinated.net>
 * Licensed MIT
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['physicsjs'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory.apply(root, ['physicsjs'].map(require));
    } else {
        factory.call(root, root.Physics);
    }
}(this, function (Physics) {
    'use strict';
    /**
     * class CanvasRenderer < Renderer
     *
     * Physics.renderer('canvas')
     *
     * Renderer that uses HTMLCanvas to render the world bodies.
     *
     * Additional config options:
     *
     * - metaEl: HTMLElement to write meta information like FPS and IPF into. (default: autogenerated)
     * - offset: Offset the shapes by this amount. (default: `{ x: 0, y: 0 }`)
     * - styles: Styles to use to draw the shapes. (see below)
     *
     * The styles property should contain _default_ styles for each shape you want to draw.
     *
     * Example:
     *
     * ```javascript
     * styles: {
     *
     *    'circle' : {
     *        strokeStyle: '#542437',
     *        lineWidth: 1,
     *        fillStyle: '#542437',
     *        angleIndicator: 'white'
     *    },
     *
     *    'convex-polygon' : {
     *        strokeStyle: '#542437',
     *        lineWidth: 1,
     *        fillStyle: '#542437',
     *        angleIndicator: 'white'
     *    }
     * }
     * ```
     *
     * Styles can also be defined on a per-body basis. Use the "styles" property for a body:
     *
     * Example:
     *
     * ```javascript
     * Physics.body('circle', {
     *     // ...
     *     styles: {
     *        strokeStyle: '#542437',
     *        lineWidth: 1,
     *        fillStyle: '#542437',
     *        angleIndicator: 'white'
     *    }
     * });
     * ```
     *
     * You can also define an image to use for a body:
     *
     * Example:
     *
     * ```javascript
     * Physics.body('circle', {
     *     // ...
     *     styles: {
     *        src: 'path/to/image.jpg',
     *        width: 40,
     *        height: 50
     *    }
     * });
     * ```
     **/
    Physics.renderer('canvas', function( proto ){

        if ( !document ){
            // must be in node environment
            return {};
        }

        var Pi2 = Math.PI * 2
            // helper to create new dom elements
            ,newEl = function( node, content ){
                var el = document.createElement(node || 'div');
                if (content){
                    el.innerHTML = content;
                }
                return el;
            }
            ,colors = {
                white: '#fff'
                ,violet: '#542437'
                ,blue: '#53777A'
            }
            ;

        var defaults = {

            // the element to place meta data into
            metaEl: null,
            // default styles of drawn objects
            styles: {

                'point': colors.blue,

                'circle' : {
                    strokeStyle: colors.blue,
                    lineWidth: 1,
                    fillStyle: colors.blue,
                    angleIndicator: colors.white
                },

                'rectangle' : {
                    strokeStyle: colors.violet,
                    lineWidth: 1,
                    fillStyle: colors.violet,
                    angleIndicator: colors.white
                },

                'convex-polygon' : {
                    strokeStyle: colors.violet,
                    lineWidth: 1,
                    fillStyle: colors.violet,
                    angleIndicator: colors.white
                }
            },
            offset: { x: 0, y: 0 }
        };

        return {

            // extended
            init: function( options ){

                var self = this;

                // call proto init
                proto.init.call(this, options);

                // further options
                this.options.defaults( defaults, true );
                this.options.onChange(function(){
                    self.options.offset = new Physics.vector( self.options.offset );
                });
                this.options( options, true );

                // hidden canvas
                this.hiddenCanvas = document.createElement('canvas');
                this.hiddenCanvas.width = this.hiddenCanvas.height = 100;

                if (!this.hiddenCanvas.getContext){
                    throw "Canvas not supported";
                }

                this.hiddenCtx = this.hiddenCanvas.getContext('2d');

                // actual viewport
                var viewport = this.el;
                if (viewport.nodeName.toUpperCase() !== 'CANVAS'){

                    viewport = document.createElement('canvas');
                    this.el.appendChild( viewport );
                    if (typeof this.options.el === 'string' && this.el === document.body){
                        viewport.id = this.options.el;
                    }
                    this.el = viewport;
                }

                this.container = this.el.parentNode;
                this.ctx = viewport.getContext('2d');

                this.els = {};

                if (this.options.meta){
                    var stats = this.options.metaEl || newEl();
                    stats.className = 'pjs-meta';
                    this.els.fps = newEl('span');
                    this.els.ipf = newEl('span');
                    stats.appendChild(newEl('span', 'fps: '));
                    stats.appendChild(this.els.fps);
                    stats.appendChild(newEl('br'));
                    stats.appendChild(newEl('span', 'ipf: '));
                    stats.appendChild(this.els.ipf);

                    viewport.parentNode.insertBefore(stats, viewport);
                }

                this._layers = {};
                this.addLayer( 'main', this.el );

                if ( this.options.autoResize ){
                    this.resize();
                } else {
                    this.resize( this.options.width, this.options.height );
                }
            },

            /**
             * CanvasRenderer#layer( id ) -> Layer
             * - id (String): The id for the layer
             *
             * Get the layer by id.
             **/
            layer: function( id ){

                if ( id in this._layers ){
                    return this._layers[ id ];
                }

                return null;
            },

            /**
             * CanvasRenderer#addLayer( id[, el, opts ] ) -> Layer
             * - id (String): The id for the layer
             * - el (HTMLElement): The canvas element to use for this layer
             * - opts (Object): The options for this layer (see below)
             *
             * Create a new layer.
             *
             * Layers can have the following options:
             *
             * - width: The width
             * - height: The height
             * - manual: Draw manually (default: `false`)
             * - autoResize: Automatically resize the layer when the renderer's [[CanvasRenderer#resize]] method is called. (default: `true`)
             * - follow: A [[Body]]. Offset this layer's rendering to follow a body's position. (default: `null`)
             * - offset: The offset [[Vectorish]] for this layer. (default: `null`)
             * - scale: Scale the layer by this amount. (default: `1`)
             * - zIndex: The zIndex for the layer's HTMLElement. (default: `1`)
             **/
            addLayer: function( id, el, opts ){

                /** belongs to: CanvasRenderer
                 * class Layer
                 *
                 * A rendering layer for the canvas renderer.
                 *
                 * Create by calling [[CanvasRenderer#addLayer]].
                 **/

                var self = this
                    ,bodies = []
                    ,styles = Physics.util.extend({}, this.options.styles)
                    ,layer = {
                        /**
                         * Layer#id = String
                         *
                         * The layer's ID
                         **/
                        id: id
                        /**
                         * Layer#el = HTMLElement
                         *
                         * The layer's Canvas
                         **/
                        ,el: el || document.createElement('canvas')
                        /** related to: Physics.util.options
                          * Layer#options( options ) -> Object
                          * - options (Object): The options to set as an object
                          * + (Object): The options
                          *
                          * Set options on this layer.
                          *
                          * Access options directly from the options object.
                          *
                          * Example:
                          *
                          * ```javascript
                          * this.options.someOption;
                          * ```
                          **/
                        ,options: Physics.util.options({
                            width: this.el.width
                            ,height: this.el.height
                            ,manual: false
                            ,autoResize: true
                            ,follow: null
                            ,offset: null
                            ,scale: 1
                            ,zIndex: 1
                        })( opts )
                    }
                    ;

                if ( id in this._layers ){
                    throw 'Layer "' + id + '" already added.';
                }

                this.el.parentNode.insertBefore( layer.el, this.el );
                layer.el.style.position = 'absolute';
                layer.el.style.zIndex = layer.options.zIndex;
                layer.el.className += ' pjs-layer-' + layer.id;
                layer.ctx = layer.el.getContext('2d');
                layer.ctx.scale( 1, 1 );
                layer.el.width = layer.options.width;
                layer.el.height = layer.options.height;

                /**
                 * Layer#bodies = Array
                 *
                 * The Bodies this layer is rendering.
                 *
                 * The "main" layer will render all world bodies if it's empty.
                 **/
                layer.bodies = bodies;

                /**
                 * Layer#reset( [arr] ) -> this
                 * - arr (Array): Array to replace the current stack of Bodies.
                 *
                 * Reset the stack.
                 **/
                layer.reset = function( arr ){

                    bodies = arr || [];
                    return layer;
                };

                /**
                 * Layer#addToStack( arr ) -> this
                 * Layer#addToStack( body ) -> this
                 * - body (Body): Body to add
                 * - arr (Array): Array of bodies to add
                 *
                 * Add body (bodies) to the rendering stack for this layer.
                 *
                 * Bodies must be added to the stack in order to be rendered by this layer UNLESS it is the "main" layer.
                 **/
                layer.addToStack = function( thing ){

                    if ( Physics.util.isArray( thing ) ){
                        bodies.push.apply( bodies, thing );
                    } else {
                        bodies.push( thing );
                    }
                    return layer;
                };

                /**
                 * Layer#removeFromStack( arr ) -> this
                 * Layer#removeFromStack( body ) -> this
                 * - body (Body): Body to remove
                 * - arr (Array): Array of bodies to remove
                 *
                 * Remove body (bodies) from the rendering stack for this layer.
                 **/
                layer.removeFromStack = function( thing ){

                    var i, l;

                    if ( Physics.util.isArray( thing ) ){
                        for ( i = 0, l = thing.length; i < l; ++i ){
                            layer.removeFromStack(thing[ i ]);
                        }
                    } else {
                        i = Physics.util.indexOf( bodies, thing );
                        if ( i > -1 ){
                            bodies.splice( i, 1 );
                        }
                    }
                    return layer;
                };

                /**
                 * Layer#render( [clear] ) -> this
                 * - clear (Boolean): Clear the canvas (default: `true`)
                 *
                 * Render the bodies in this layer's stack.
                 *
                 * If you want you can replace this function with your own to do custom rendering.
                 *
                 * Example:
                 *
                 * ```javascript
                 * layer.render = myCustomRenderFn;
                 * ```
                 **/
                layer.render = function( clear ){

                    var body
                        ,scratch = Physics.scratchpad()
                        ,offset = scratch.vector().set(0, 0)
                        ,scale = layer.options.scale
                        ,view
                        ,i
                        ,l = bodies.length
                        ,t = self._interpolateTime
                        ,stack = (l || layer.id !== 'main') ? bodies : self._world._bodies
                        ;

                    if ( layer.options.manual ){
                        scratch.done();
                        return layer;
                    }

                    if ( layer.options.offset ){
                        if ( layer.options.offset === 'center' ){
                            offset.add( layer.el.width * 0.5, layer.el.height * 0.5 ).mult( 1/scale );
                        } else {
                            offset.vadd( layer.options.offset ).mult( 1/scale );
                        }
                    }

                    if ( layer.options.follow ){
                        offset.vsub( layer.options.follow.state.pos );
                        offset.sub( layer.options.follow.state.vel.get(0)*t, layer.options.follow.state.vel.get(1)*t );
                    }

                    if ( clear !== false ){
                        layer.ctx.clearRect(0, 0, layer.el.width, layer.el.height);
                    }

                    if ( scale !== 1 ){
                        layer.ctx.save();
                        layer.ctx.scale( scale, scale );
                    }

                    for ( i = 0, l = stack.length; i < l; ++i ){

                        body = stack[ i ];
                        if ( !body.hidden ){
                            view = body.view || ( body.view = self.createView(body.geometry, body.styles || styles[ body.geometry.name ]) );
                            self.drawBody( body, body.view, layer.ctx, offset );
                        }
                    }

                    if ( scale !== 1 ){
                        layer.ctx.restore();
                    }

                    scratch.done();
                    return layer;
                };

                // remember layer
                this._layers[ id ] = layer;

                return layer;
            },

            /**
             * CanvasRenderer#removeLayer( id ) -> this
             * CanvasRenderer#removeLayer( layer ) -> this
             * - id (String): The id for the layer
             * - layer (Layer): The layer
             *
             * Remove a layer.
             **/
            removeLayer: function( idOrLayer ){

                var id = idOrLayer.id ? idOrLayer.id : idOrLayer
                    ,el = this._layers[ id ].el
                    ;

                if ( el !== this.el ){
                    el.parentNode.removeChild( el );
                }
                delete this._layers[ id ];
                return this;
            },

            /**
             * CanvasRenderer#resize( width, height ) -> this
             * - width (Number): The width
             * - height (Number): The height
             *
             * Resize all layer canvases that have the `autoResize` option set to `true`.
             **/
            resize: function( width, height ){

                var layer;
                proto.resize.call( this, width, height );

                for ( var id in this._layers ){

                    layer = this._layers[ id ];
                    if ( layer.options.autoResize ){
                        layer.el.width = this.width;
                        layer.el.height = this.height;
                    }
                }

                return this;
            },

            /**
             * CanvasRenderer#setStyle( styles[, ctx] )
             * - styles (Object|String): Styles to set on the canvas context
             * - ctx (Canvas2DContext): The canvas context
             *
             * Set styles on the specified canvas context (or main context).
             **/
            setStyle: function( styles, ctx ){

                ctx = ctx || this.ctx;

                if ( Physics.util.isObject(styles) ){

                    styles.strokeStyle = styles.lineWidth ? styles.strokeStyle : 'rgba(0,0,0,0)';
                    Physics.util.extend(ctx, styles);

                } else {

                    ctx.fillStyle = ctx.strokeStyle = styles;
                    ctx.lineWidth = 1;
                }
            },

            /**
             * CanvasRenderer#drawCircle( x, y, r, styles[, ctx] )
             * - x (Number): The x coord
             * - y (Number): The y coord
             * - r (Number): The circle radius
             * - styles (Object): The styles configuration
             * - ctx (Canvas2DContext): The canvas context
             *
             * Draw a circle to specified canvas context.
             **/
            drawCircle: function(x, y, r, styles, ctx){

                ctx = ctx || this.ctx;

                ctx.beginPath();
                this.setStyle( styles, ctx );
                ctx.arc(x, y, r, 0, Pi2, false);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();
            },

            /**
             * CanvasRenderer#drawPolygon( verts, styles[, ctx] )
             * - verts (Array): Array of [[Vectorish]] vertices
             * - styles (Object): The styles configuration
             * - ctx (Canvas2DContext): The canvas context
             *
             * Draw a polygon to specified canvas context.
             **/
            drawPolygon: function(verts, styles, ctx){

                var vert = verts[0]
                    ,x = vert.x
                    ,y = vert.y
                    ,l = verts.length
                    ;

                ctx = ctx || this.ctx;
                ctx.beginPath();
                this.setStyle( styles, ctx );

                ctx.moveTo(x, y);

                for ( var i = 1; i < l; ++i ){

                    vert = verts[ i ];
                    x = vert.x;
                    y = vert.y;
                    ctx.lineTo(x, y);
                }

                if ( l > 2 ){
                    ctx.closePath();
                }

                ctx.stroke();
                ctx.fill();
            },

            /**
             * CanvasRenderer#drawRect( x, y, width, height, styles[, ctx] )
             * - x (Number): The x coord
             * - y (Number): The y coord
             * - width (Number): The width
             * - height (Number): The height
             * - styles (Object): The styles configuration
             * - ctx (Canvas2DContext): The canvas context
             *
             * Draw a rectangle to specified canvas context.
             **/
            drawRect: function(x, y, width, height, styles, ctx){

                var hw = width * 0.5
                    ,hh = height * 0.5
                    ;

                ctx = ctx || this.ctx;
                this.setStyle( styles, ctx );
                ctx.beginPath();
                ctx.rect(x - hw, y - hh, width, height);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();
            },

            /**
             * CanvasRenderer#drawLine( from, to, styles[, ctx] )
             * - from (Vectorish): The starting pt
             * - to (Vectorish): The ending pt
             * - styles (Object): The styles configuration
             * - ctx (Canvas2DContext): The canvas context
             *
             * Draw a line onto specified canvas context.
             **/
            drawLine: function(from, to, styles, ctx){

                var x = from.x
                    ,y = from.y
                    ;

                ctx = ctx || this.ctx;

                ctx.beginPath();
                this.setStyle( styles, ctx );

                ctx.moveTo(x, y);

                x = to.x;
                y = to.y;

                ctx.lineTo(x, y);

                ctx.stroke();
                ctx.fill();
            },

            /**
             * CanvasRenderer#draw( geometry[, styles, ctx, offset] ) -> this
             * - geometry (Geometry): The shape to draw
             * - styles (Object): The styles configuration
             * - ctx (Canvas2DContext): The canvas context
             * - offset (Vectorish): The offset from center
             *
             * Draw a geometry to a context.
             **/
            draw: function( geometry, styles, ctx, offset ){

                var name = geometry.name
                    ,x = +(offset && offset.x)
                    ,y = +(offset && offset.y)
                    ,w = geometry.aabb().hw
                    ;

                ctx = ctx || this.ctx;
                styles = styles || this.options.styles[ name ] || this.options.styles.circle || {};

                ctx.save();
                ctx.translate(x, y);

                if (name === 'circle'){

                    this.drawCircle(0, 0, geometry.radius, styles, ctx);

                } else if (name === 'convex-polygon'){

                    this.drawPolygon(geometry.vertices, styles, ctx);

                } else if (name === 'rectangle'){

                    this.drawRect(0, 0, geometry.width, geometry.height, styles, ctx);

                } else if (name === 'compound'){

                    for ( var i = 0, l = geometry.children.length, ch; i < l; i++ ){
                        ch = geometry.children[ i ];

                        // translate
                        ctx.translate(ch.pos.x, ch.pos.y);
                        // rotate
                        ctx.rotate(ch.angle);

                        this.draw( ch.g, ch.styles, ctx );

                        // unrotate
                        ctx.rotate(-ch.angle);
                        // untranslate
                        ctx.translate(-ch.pos.x, -ch.pos.y);
                    }

                } else {

                    // assume it's a point
                    this.drawCircle(0, 0, 1, styles, ctx);
                }

                if (name !== 'compound' && styles.angleIndicator){

                    ctx.beginPath();
                    this.setStyle( styles.angleIndicator, ctx );
                    ctx.moveTo(0, 0);
                    ctx.lineTo(w, 0);
                    ctx.closePath();
                    ctx.stroke();
                }

                ctx.restore();

                return this;
            },

            // extended
            createView: function( geometry, styles ){

                var view
                    ,aabb = geometry.aabb()
                    ,hw = aabb.hw + Math.abs(aabb.x)
                    ,hh = aabb.hh + Math.abs(aabb.y)
                    ,offset = { x: hw + 1, y: hh + 1 }
                    ,hiddenCtx = this.hiddenCtx
                    ,hiddenCanvas = this.hiddenCanvas
                    ;

                styles = styles || this.options.styles[ name ] || this.options.styles.circle || {};

                // must want an image
                if ( styles.src ){
                    view = new Image();
                    view.src = styles.src;
                    if ( styles.width ){
                        view.width = styles.width;
                    }
                    if ( styles.height ){
                        view.height = styles.height;
                    }
                    return view;
                }

                offset.x += styles.lineWidth | 0;
                offset.y += styles.lineWidth | 0;

                // clear and resize
                hiddenCanvas.width = 2 * hw + 2 + (2 * styles.lineWidth|0);
                hiddenCanvas.height = 2 * hh + 2 + (2 * styles.lineWidth|0);

                this.draw( geometry, styles, hiddenCtx, offset );

                view = new Image( hiddenCanvas.width, hiddenCanvas.height );
                view.src = hiddenCanvas.toDataURL('image/png');
                return view;
            },

            // extended
            drawMeta: function( meta ){

                this.els.fps.innerHTML = meta.fps.toFixed(2);
                this.els.ipf.innerHTML = meta.ipf;
            },

            // extended
            drawBody: function( body, view, ctx, offset ){

                var pos = body.state.pos
                    ,os = body.offset
                    ,v = body.state.vel
                    ,t = this._interpolateTime || 0
                    ,x
                    ,y
                    ,ang
                    ,aabb
                    ;

                offset = offset || this.options.offset;
                ctx = ctx || this.ctx;

                // interpolate positions
                x = pos._[0] + offset.x + v._[0] * t;
                y = pos._[1] + offset.y + v._[1] * t;
                ang = body.state.angular.pos + body.state.angular.vel * t;

                ctx.save();
                ctx.translate( x, y );
                ctx.rotate( ang );
                ctx.translate( os._[0], os._[1] );
                ctx.drawImage(view, -view.width/2, -view.height/2, view.width, view.height);
                ctx.restore();
            },

            // extended
            render: function( bodies, meta ){

                var body
                    ,view
                    ,pos
                    ;

                this._world.emit('beforeRender', {
                    renderer: this,
                    meta: meta
                });

                if ( this.options.meta ) {
                    this.drawMeta( meta );
                }

                this._interpolateTime = meta.interpolateTime;

                for ( var id in this._layers ){

                    this._layers[ id ].render();
                }

                return this;
            }
        };
    });

    // end module: renderers/canvas.js
    return Physics;
}));// UMD