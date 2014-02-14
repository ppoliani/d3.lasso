

/**
 * A plugin for d3.js that implements a lasso tool
 *
 * @author Pavlos Polianidis
 */
d3.lasso = function (opts) {
    /**
     * Returns the initial offset of the target element
     */
    var getInitialOffset = function () {
        var defaultOffset = { top: 0, left: 0 },
            domEl = $(el),
            position = domEl.css('position');
        

        return position === 'relative' || position === 'absolute'
            ? domEl.offset()
            : defaultOffset;
    };


    var el = opts.target,
        $el = $(el),
        appendTo = 'html>body',
        clickX, clickY,
        moveX, moveY,
        newX, newY,
        width, height,
        $selection = $('<div>').addClass('selection-box'),
        elLocation = getInitialOffset(),
        leftBtnClicked = false,
        dragOn = false;

    //#region event callbacks

    var
        /**
         * mousedown callback
         */
        dragStarted = function (event) {
            //var event = d3.event;
            event.preventDefault();

            if (!isLeftBtnClicked(event)) {
                return;
            }
            
            leftBtnClicked = true;
            // consider the current offset of this element
            clickX = event.pageX; // + elLocation.left;
            clickY = event.pageY; // + elLocation.top;

            updateCss(0, 0, clickY, clickX, '0');
            $selection.appendTo(appendTo);
        },

         /**
         * mousemove callback
         */
        drag = function (event) {
            //var event = d3.event;
            event.preventDefault();

            if (!leftBtnClicked) {
                return;
            }
            
            dragOn = true;
            // consider the current offset of this element
            moveX = event.pageX; // + elLocation.left;
            moveY = event.pageY; // + elLocation.top;
            width = Math.abs(moveX - clickX);
            height = Math.abs(moveY - clickY);

            // consider the drag direction
            newX = (moveX < clickX) ? (clickX - width) : clickX;
            newY = (moveY < clickY) ? (clickY - height) : clickY;

            var padding = getPadding();
            updateCss(width, height, newY + padding.y, newX + padding.x, '1px');
        },

        /**
         * mousemove mouseup
         */
        dragend = function (event) {
           // var event = d3.event;
            event.preventDefault();
            event.stopPropagation();
            
            if (!isLeftBtnClicked(event)) {
                return;
            }
            
            $selection.remove();

            // did we have a mousemove event earlier?
            if (!dragOn) {
                return;
            }
            
            leftBtnClicked = false;
            dragOn = false;
            
            opts.callback({
                start: getLassoRelativeStartPoint(),
                points: getLassoCornerPoints(),
                width: moveX - clickX,
                height: moveY - clickY,
                ctrlPressed: event.ctrlKey
            });
        };       

    //#endregion
    
    //#region private methods
    
    var
        /**
         * Updates the css of the selection box
         *
         * @param {number} w - The new width of the seleciton box
         * @param {number} h - The new height of the seleciton box
         * @param {number} top - The new top position of the seleciton box
         * @param {number} left - The new left position of the seleciton box
         */
        updateCss = function (w, h, top, left, borderWidth) {
            $selection.css({
                'width': w,
                'height': h,
                'top': top,
                'left': left,
                'border-width': borderWidth
            });
        },

        /**
         * Examines if the left mouse btn was clicked
         */
        isLeftBtnClicked = function (event) {
            var btnClicked = event.which,
                NO_BTN = 0,
                MIDDLE_BTN = 2,
                RIGHT_BTN = 3;

            if (btnClicked === MIDDLE_BTN
                || btnClicked === RIGHT_BTN
                || btnClicked === NO_BTN) {
                return false;
            }

            return true;
        },
        
        /**
         * Returns the relative to the parent node start point of the rectangle
         */
        getLassoRelativeStartPoint = function() {
            return {
                x: clickX - elLocation.left,
                y: clickY - elLocation.top
            };
        },
        
        /**
         * Returns the relative to the parent node end point of the rectangle
         */
        getLassoRelativeEndPoint = function() {
            return {
                x: moveX-elLocation.left,
                y: moveY-elLocation.top
            };
        },
        
        /**
         * Returns the width of the rectangle
         */
        getLassoWidth = function() {
            return moveX - clickX;
        },
        
        /**
         * Returns the width of the rectangle
         */
        getLassoHeight = function() {
            return moveY - clickY;
        },
        
        /**
         * Returns the four corner points of the rectangle
         */
        getLassoCornerPoints = function() {
            var w = getLassoWidth(),
                h = getLassoHeight(),
                startPoint = getLassoRelativeStartPoint();

            return [
                { x: startPoint.x, y: startPoint.y }, ,
                { x: startPoint.x + w, y: startPoint.y },
                { x: startPoint.x, y: startPoint.y + h },
                { x: startPoint.x + w, y: startPoint.y + h }
            ];
        },

        /** 
         *returns a small space so that the mouseup event is fired on the target element
         */
        getPadding = function () {
            var padding = {};
            padding.x = moveX < clickX
                ? 2
                : -2;
            padding.y = moveY < clickY
                ? 2
                : -2;

            return padding;
        };

    //#endregion

    // attach the events to the target element
    $el.on('dragstart.lasso', function(e, eventInfo) { return dragStarted(eventInfo); })
       .on('dragmove.lasso', function (e, eventInfo) { return drag(eventInfo); })
       .on('dragend.lasso', function(e, eventInfo) { return dragend(eventInfo); });
};
