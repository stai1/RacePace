$(function() {
  $(".sortable th").click(function(e) {
    let $target = $(e.currentTarget)
    let $tablebody = $target.parent().parent().parent().find("tbody");
    let $rows = $tablebody.find("tr");
    let columnIndex = $target.parent().find("th").index($target);
    let rows = [...$rows];
    
    let reverse = false
    
    $target.parent().find("th").not($target).removeClass("asc dsc");
    if(!$target.hasClass("asc")) {
      $target.removeClass("dsc");
      $target.addClass("asc");
    }
    else {
      $target.removeClass("asc");
      reverse = true;
      $target.addClass("dsc");
    }
    mergesort(rows, new Comparator(columnIndex), reverse);
    $rows.detach();
    for(let i = 0; i < rows.length; ++i) {
      $tablebody.append(rows[i]);
    }
    
    
  }
  );
});

class Comparator {
  constructor(index) {
    this.index = index;
  }
  
  /**
   * Compares table row DOM elements (not jQuery but uses jQuery)
   */
  compare(a,b) {
    let a_DOM = $(a).find("td")[this.index];
    let b_DOM = $(b).find("td")[this.index];
    let $a = $(a_DOM);
    let $b = $(b_DOM);
    if($a.data().hasOwnProperty("data") && $b.data().hasOwnProperty("data"))
        return ($a.data().data > $b.data().data) - ($a.data().data < $b.data().data);
    return (a_DOM.innerHTML > b_DOM.innerHTML) - (a_DOM.innerHTML < b_DOM.innerHTML);
  }
}

/**
 * Wrapper for merge sort that takes start and end index
 * @param {Array} arr - Array to sort
 * @param {Comparator} comparator - Object with compare(a,b) method
 * @param {boolean} reverse - Sort order
 */
function mergesort(arr, comparator, reverse = false) {
  mergesortWrapped(arr, 0, arr.length, comparator, reverse);
}

/**
 * Recursive merge sort
 * @param {Array} arr - Array to sort
 * @param {number} start - Start index of subarray to sort
 * @param {number} end - End index of subarray to sort
 * @param {Comparator} comparator - Object with compare(a,b) method
 * @param {boolean} reverse - Sort order
 */
function mergesortWrapped(arr, start, end, comparator, reverse = false) {
  if(end-start <= 1) return; // already sorted
  
  let mid = Math.floor((start+end)/2);
  mergesortWrapped(arr, start, mid, comparator, reverse);
  mergesortWrapped(arr, mid, end, comparator, reverse);
  
  // merge
  // copy only left array
  // because array write locationo will never "catch up" to right array read location
  let L = arr.slice(start, mid);
  let i_L = 0; // index of left array copy reader
  let n_L = mid-start;
  let i_R = mid; // index of right array reader
  let i = start; // index of array writer
  let direction = reverse ? -1 : 1;
  while(i_L < n_L && i_R < end) {
    if(direction * comparator.compare(L[i_L],arr[i_R]) <= 0) {
      arr[i++] = L[i_L++];
    }
    else {
      arr[i++] = arr[i_R++];
    }
  }
  
  while(i_L < n_L) {
    arr[i++] = L[i_L++];
  }
  
}